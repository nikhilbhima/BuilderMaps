import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/utils/sanitize";
import { validateOrigin, csrfError } from "@/utils/csrf";

// Rate limiting: simple in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // city requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json(csrfError(), { status: 403 });
  }

  // Get client IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  // Check if user is logged in (optional)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();

    // Validate city name
    const cityName = sanitizeText(body.cityName);
    if (!cityName || cityName.length < 2) {
      return NextResponse.json(
        { error: "City name is required (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (cityName.length > 100) {
      return NextResponse.json(
        { error: "City name is too long" },
        { status: 400 }
      );
    }

    // Insert city request
    const { error } = await supabase.from("city_requests").insert({
      city_name: cityName,
      requested_by: user?.id || null,
      status: "pending",
    });

    if (error) {
      // Check for duplicate
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "This city has already been requested",
        });
      }
      console.error("Failed to insert city request:", error);
      return NextResponse.json(
        { error: "Failed to submit city request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "City request submitted successfully",
    });
  } catch (error) {
    console.error("City request error:", error);
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
