import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeReviewText } from "@/utils/sanitize";
import { validateOrigin, csrfError } from "@/utils/csrf";

// Rate limiting: simple in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // reviews per window
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json(csrfError(), { status: 403 });
  }

  const { spotId } = await params;

  if (!spotId) {
    return NextResponse.json({ error: "Spot ID is required" }, { status: 400 });
  }

  // Get client IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reviews. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  // User must be logged in to review
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to submit a review" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate rating
    const rating = parseInt(body.rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate and sanitize review text
    const text = sanitizeReviewText(body.text, 500);
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "Review text is required (at least 10 characters)" },
        { status: 400 }
      );
    }

    // Get user metadata for author info
    const metadata = user.user_metadata || {};
    const authorHandle =
      metadata.user_name || metadata.preferred_username || metadata.name || "user";
    const authorName = metadata.full_name || metadata.name || authorHandle;
    const rawProvider = user.app_metadata?.provider || "twitter";
    const provider = rawProvider === "linkedin_oidc" ? "linkedin" : "twitter";

    // Check if user already reviewed this spot
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("spot_id", spotId)
      .single();

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating,
          text,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id);

      if (error) {
        console.error("Failed to update review:", error);
        return NextResponse.json(
          { error: "Failed to update review" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Review updated successfully",
      });
    }

    // Insert new review
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      spot_id: spotId,
      rating,
      text,
      author_handle: authorHandle,
      author_name: authorName,
      provider,
    });

    if (error) {
      console.error("Failed to insert review:", error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;

  if (!spotId) {
    return NextResponse.json({ error: "Spot ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("id, rating, text, author_handle, author_name, provider, created_at")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
