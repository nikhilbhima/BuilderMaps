import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  sanitizeSpotName,
  sanitizeReviewText,
  sanitizeUrl,
  sanitizeHandle,
  validateCoordinates,
} from "@/utils/sanitize";
import { validateOrigin, csrfError } from "@/utils/csrf";
import { sanitizeCustomLinks } from "@/utils/socialLinks";

// Rate limiting: simple in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // nominations per window
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
      { error: "Too many nominations. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  // Check if user is logged in (optional - allow anonymous nominations)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();

    // Validate required fields
    const name = sanitizeSpotName(body.name);
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Spot name is required (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (!body.cityId || typeof body.cityId !== "string") {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    if (!body.types || !Array.isArray(body.types) || body.types.length === 0) {
      return NextResponse.json(
        { error: "At least one spot type is required" },
        { status: 400 }
      );
    }

    const validTypes = ["coworking", "hacker-house", "cafe", "community"];
    const types = body.types.filter((t: string) => validTypes.includes(t));
    if (types.length === 0) {
      return NextResponse.json(
        { error: "Invalid spot type" },
        { status: 400 }
      );
    }

    const description = sanitizeReviewText(body.description, 1000);
    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Description is required (at least 10 characters)" },
        { status: 400 }
      );
    }

    // Validate vibes
    const validVibes = [
      "deep focus", "networking", "fast wifi", "good coffee", "3am friendly",
      "quiet zone", "loud debates", "outdoor seating", "pet friendly",
      "power outlets", "meeting rooms", "24/7 access", "events", "demo days",
      "mentorship", "beginner friendly", "ai builders", "crypto crowd",
      "indie hackers", "vc sightings",
    ];
    const vibes = Array.isArray(body.vibes)
      ? body.vibes.filter((v: string) => validVibes.includes(v)).slice(0, 5)
      : [];

    // Validate coordinates if provided
    let lat = null;
    let lng = null;
    if (body.lat !== null && body.lng !== null) {
      const coords: [number, number] = [body.lng, body.lat];
      if (validateCoordinates(coords)) {
        lat = body.lat;
        lng = body.lng;
      }
    }

    // Sanitize optional URLs
    const googleMapsUrl = sanitizeUrl(body.googleMapsUrl);
    const websiteUrl = sanitizeUrl(body.websiteUrl);
    const linkedinUrl = sanitizeUrl(body.linkedinUrl);
    const lumaUrl = sanitizeUrl(body.lumaUrl);
    const twitterHandle = sanitizeHandle(body.twitterHandle || "");
    const instagramHandle = sanitizeHandle(body.instagramHandle || "");

    // Sanitize custom links
    const customLinks = body.customLinks
      ? sanitizeCustomLinks(body.customLinks)
      : [];

    // Insert nomination
    const { data, error } = await supabase.from("nominations").insert({
      name,
      city_id: body.cityId,
      types,
      description,
      vibes,
      lat,
      lng,
      google_maps_url: googleMapsUrl,
      website_url: websiteUrl,
      twitter_handle: twitterHandle || null,
      instagram_handle: instagramHandle || null,
      linkedin_url: linkedinUrl,
      luma_url: lumaUrl,
      custom_links: customLinks.length > 0 ? customLinks : null,
      submitted_by: user?.id || null,
      status: "pending",
    }).select().single();

    if (error) {
      console.error("Failed to insert nomination:", error);
      return NextResponse.json(
        { error: "Failed to submit nomination" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Nomination submitted successfully",
      id: data.id,
    });
  } catch (error) {
    console.error("Nomination error:", error);
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
