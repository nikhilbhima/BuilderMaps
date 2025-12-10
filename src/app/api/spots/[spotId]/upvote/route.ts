import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { upvotes, spots, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Helper to ensure user exists in database (lazy creation)
async function ensureUserExists(session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; handle?: string; provider?: "x" | "linkedin" } }) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: session.user.id,
      email: session.user.email || undefined,
      handle: session.user.handle || session.user.name || session.user.id,
      displayName: session.user.name,
      avatarUrl: session.user.image,
      provider: session.user.provider || "x",
    });
  }
}

// POST /api/spots/[spotId]/upvote - Toggle upvote on a spot
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

    // Ensure user exists in database (lazy creation)
    await ensureUserExists(session);

    // Check if spot exists
    const spot = await db.query.spots.findFirst({
      where: eq(spots.id, spotId),
    });

    if (!spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    // Check if already upvoted
    const existingUpvote = await db.query.upvotes.findFirst({
      where: and(
        eq(upvotes.userId, session.user.id),
        eq(upvotes.spotId, spotId)
      ),
    });

    if (existingUpvote) {
      // Remove upvote
      await db
        .delete(upvotes)
        .where(
          and(eq(upvotes.userId, session.user.id), eq(upvotes.spotId, spotId))
        );

      // Get new count
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(upvotes)
        .where(eq(upvotes.spotId, spotId));

      return NextResponse.json({
        upvoted: false,
        count: result.count,
      });
    } else {
      // Add upvote
      await db.insert(upvotes).values({
        userId: session.user.id,
        spotId,
      });

      // Get new count
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(upvotes)
        .where(eq(upvotes.spotId, spotId));

      return NextResponse.json({
        upvoted: true,
        count: result.count,
      });
    }
  } catch (error) {
    console.error("Failed to toggle upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}

// GET /api/spots/[spotId]/upvote - Get upvote status and count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const { spotId } = await params;
    const session = await auth();

    // Get upvote count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(upvotes)
      .where(eq(upvotes.spotId, spotId));

    // Get upvoters with their info
    const upvotersList = await db
      .select({
        handle: users.handle,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        provider: users.provider,
      })
      .from(upvotes)
      .innerJoin(users, eq(upvotes.userId, users.id))
      .where(eq(upvotes.spotId, spotId))
      .limit(10);

    // Check if current user has upvoted
    let userUpvoted = false;
    if (session?.user?.id) {
      const existingUpvote = await db.query.upvotes.findFirst({
        where: and(
          eq(upvotes.userId, session.user.id),
          eq(upvotes.spotId, spotId)
        ),
      });
      userUpvoted = !!existingUpvote;
    }

    return NextResponse.json({
      count: countResult.count,
      upvoted: userUpvoted,
      upvoters: upvotersList,
    });
  } catch (error) {
    console.error("Failed to get upvote info:", error);
    return NextResponse.json(
      { error: "Failed to get upvote info" },
      { status: 500 }
    );
  }
}
