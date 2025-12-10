import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { upvotes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/user/upvotes - Get current user's upvoted spot IDs
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userUpvotes = await db
      .select({ spotId: upvotes.spotId })
      .from(upvotes)
      .where(eq(upvotes.userId, session.user.id));

    const spotIds = userUpvotes.map((u) => u.spotId);

    return NextResponse.json({ spotIds });
  } catch (error) {
    console.error("Failed to fetch user upvotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch user upvotes" },
      { status: 500 }
    );
  }
}
