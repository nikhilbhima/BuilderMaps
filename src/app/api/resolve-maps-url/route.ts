import { NextRequest, NextResponse } from "next/server";

// Allowed Google Maps domains to prevent SSRF attacks
const ALLOWED_HOSTS = [
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
];

// Rate limiting: simple in-memory store (use Redis in production with real DB)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

function isValidGoogleMapsUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Must be HTTPS (or HTTP which we'll upgrade)
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    // Check if hostname is in allowed list
    const hostname = url.hostname.toLowerCase();
    return ALLOWED_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  // Validate URL is a Google Maps URL (prevents SSRF)
  if (!isValidGoogleMapsUrl(url)) {
    return NextResponse.json(
      { error: "Invalid URL. Only Google Maps links are allowed." },
      { status: 400 }
    );
  }

  try {
    // Follow redirects to get the final URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Validate the final URL is also a Google domain
    const finalUrl = response.url;
    if (!isValidGoogleMapsUrl(finalUrl)) {
      return NextResponse.json(
        { error: "Redirect led to non-Google URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ resolvedUrl: finalUrl });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out" },
        { status: 408 }
      );
    }
    console.error("Failed to resolve URL:", error);
    return NextResponse.json(
      { error: "Failed to resolve URL" },
      { status: 500 }
    );
  }
}
