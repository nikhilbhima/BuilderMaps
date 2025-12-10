import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spots, upvotes } from "@/lib/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/spots - Get all spots or filter by city
export async function GET(request: NextRequest) {
  try {
    const cityId = request.nextUrl.searchParams.get("cityId");

    // Get spots with upvote counts
    const spotsWithCounts = await db
      .select({
        id: spots.id,
        name: spots.name,
        cityId: spots.cityId,
        types: spots.types,
        description: spots.description,
        lng: spots.lng,
        lat: spots.lat,
        vibes: spots.vibes,
        googleMapsUrl: spots.googleMapsUrl,
        lumaUrl: spots.lumaUrl,
        websiteUrl: spots.websiteUrl,
        twitterUrl: spots.twitterUrl,
        instagramUrl: spots.instagramUrl,
        linkedinUrl: spots.linkedinUrl,
        addedBy: spots.addedBy,
        approved: spots.approved,
        featured: spots.featured,
        createdAt: spots.createdAt,
        upvoteCount: sql<number>`count(${upvotes.userId})::int`,
      })
      .from(spots)
      .leftJoin(upvotes, eq(spots.id, upvotes.spotId))
      .where(cityId ? and(eq(spots.cityId, cityId), eq(spots.approved, true)) : eq(spots.approved, true))
      .groupBy(spots.id)
      .orderBy(desc(spots.featured), desc(sql`count(${upvotes.userId})`));

    return NextResponse.json(spotsWithCounts);
  } catch (error) {
    console.error("Failed to fetch spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch spots" },
      { status: 500 }
    );
  }
}

// POST /api/spots - Create a new spot (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      cityId,
      types,
      description,
      lng,
      lat,
      vibes,
      googleMapsUrl,
      lumaUrl,
      websiteUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
    } = body;

    // Validate required fields
    if (!name || !cityId || !types?.length || !description || lng == null || lat == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const spotId = `spot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(spots).values({
      id: spotId,
      name,
      cityId,
      types,
      description,
      lng,
      lat,
      vibes: vibes || [],
      googleMapsUrl,
      lumaUrl,
      websiteUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      addedBy: session.user.handle || session.user.name || "unknown",
      approved: false, // Requires admin approval
      featured: false,
    });

    return NextResponse.json({ id: spotId, message: "Spot submitted for review" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create spot:", error);
    return NextResponse.json(
      { error: "Failed to create spot" },
      { status: 500 }
    );
  }
}
