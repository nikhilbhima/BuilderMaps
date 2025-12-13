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
    // Get upvoters with user details in a single query using left join
    const { data: upvotes, error } = await supabase
      .from("upvotes")
      .select(`
        user_id,
        created_at,
        user:users(id, handle, display_name, provider, avatar_url)
      `)
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching upvotes:", error);
      return NextResponse.json({ error: "Failed to fetch upvoters" }, { status: 500 });
    }

    if (!upvotes || upvotes.length === 0) {
      return NextResponse.json({ upvoters: [] });
    }

    // Build upvoters list - handle both joined data and missing user records
    const upvoters = upvotes.map(upvote => {
      // user can be null, an object, or an array with one item depending on Supabase version
      const userInfo = Array.isArray(upvote.user) ? upvote.user[0] : upvote.user;

      // Normalize provider: "twitter" -> "x"
      let provider: "x" | "linkedin" = "x";
      if (userInfo?.provider === "linkedin" || userInfo?.provider === "linkedin_oidc") {
        provider = "linkedin";
      }

      return {
        handle: userInfo?.handle || "user",
        displayName: userInfo?.display_name || undefined,
        provider,
        avatarUrl: userInfo?.avatar_url || undefined,
      };
    });

    return NextResponse.json({ upvoters });
  } catch (error) {
    console.error("Error in spot-upvoters:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
