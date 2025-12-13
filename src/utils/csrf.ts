import { NextRequest } from "next/server";

/**
 * List of allowed origins for CSRF protection
 */
const ALLOWED_ORIGINS = [
  "https://builder-maps.vercel.app",
  "https://www.builder-maps.vercel.app",
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean);

// Add localhost in development
if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000");
  ALLOWED_ORIGINS.push("http://127.0.0.1:3000");
}

/**
 * Validate request origin for CSRF protection
 * Returns true if request is from an allowed origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // For same-origin requests, origin might be null
  // In that case, check referer
  if (!origin && !referer) {
    // Allow requests without origin/referer only in development
    return process.env.NODE_ENV === "development";
  }

  // Check origin header first
  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => allowed && origin.startsWith(allowed));
  }

  // Fall back to referer
  if (referer) {
    return ALLOWED_ORIGINS.some((allowed) => allowed && referer.startsWith(allowed));
  }

  return false;
}

/**
 * CSRF error response
 */
export function csrfError() {
  return { error: "Invalid request origin" };
}
