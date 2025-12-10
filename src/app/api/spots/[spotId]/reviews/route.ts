import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, spots, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sanitizeReviewText } from "@/utils/sanitize";

// GET /api/spots/[spotId]/reviews - Get reviews for a spot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const { spotId } = await params;

    const reviewsList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.text,
        createdAt: reviews.createdAt,
        user: {
          handle: users.handle,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          provider: users.provider,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.spotId, spotId))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(reviewsList);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/spots/[spotId]/reviews - Create a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spotId } = await params;
    const body = await request.json();
    const { rating, text } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate and sanitize text
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 }
      );
    }

    const sanitizedText = sanitizeReviewText(text, 500);
    if (sanitizedText.length < 10) {
      return NextResponse.json(
        { error: "Review must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Check if spot exists
    const spot = await db.query.spots.findFirst({
      where: eq(spots.id, spotId),
    });

    if (!spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    // Check if user already reviewed this spot
    const existingReview = await db.query.reviews.findFirst({
      where: (reviews, { and, eq }) =>
        and(eq(reviews.userId, session.user.id), eq(reviews.spotId, spotId)),
    });

    if (existingReview) {
      // Update existing review
      await db
        .update(reviews)
        .set({
          rating,
          text: sanitizedText,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existingReview.id));

      return NextResponse.json({ message: "Review updated" });
    }

    // Create new review
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(reviews).values({
      id: reviewId,
      spotId,
      userId: session.user.id,
      rating,
      text: sanitizedText,
    });

    return NextResponse.json(
      { id: reviewId, message: "Review created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
