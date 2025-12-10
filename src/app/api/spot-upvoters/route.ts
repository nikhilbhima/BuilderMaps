import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const spotId = request.nextUrl.searchParams.get("spotId");

  if (!spotId) {
    return NextResponse.json({ error: "spotId required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login required to view upvoters" }, { status: 401 });
  }

  try {
    // Get upvoters for this spot, joined with users table
    const { data: upvotes, error } = await supabase
      .from("upvotes")
      .select("user_id, created_at")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching upvotes:", error);
      return NextResponse.json({ error: "Failed to fetch upvoters" }, { status: 500 });
    }

    if (!upvotes || upvotes.length === 0) {
      return NextResponse.json({ upvoters: [] });
    }

    // Get user details for each upvoter
    const userIds = upvotes.map(u => u.user_id);
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, handle, display_name, provider, avatar_url")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Map users by ID for quick lookup
    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Build upvoters list
    const upvoters = upvotes.map(upvote => {
      const userInfo = userMap.get(upvote.user_id);
      return {
        handle: userInfo?.handle || "user",
        displayName: userInfo?.display_name || undefined,
        provider: (userInfo?.provider as "x" | "linkedin") || "x",
        avatarUrl: userInfo?.avatar_url || undefined,
      };
    });

    return NextResponse.json({ upvoters });
  } catch (error) {
    console.error("Error in spot-upvoters:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
