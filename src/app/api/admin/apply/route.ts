import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("id, handle")
      .eq("id", user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { requestedCities, reason, socialProof } = body;

    // Validate
    if (!requestedCities || !Array.isArray(requestedCities) || requestedCities.length === 0) {
      return NextResponse.json({ error: "At least one city must be selected" }, { status: 400 });
    }

    if (!reason || typeof reason !== "string" || reason.length < 20) {
      return NextResponse.json(
        { error: "Reason must be at least 20 characters" },
        { status: 400 }
      );
    }

    if (reason.length > 1000) {
      return NextResponse.json(
        { error: "Reason must be less than 1000 characters" },
        { status: 400 }
      );
    }

    // Check if user already has a pending application
    const { data: existingApplication } = await supabase
      .from("admin_applications")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have a pending application" },
        { status: 400 }
      );
    }

    // Check if user is already an admin
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "You are already an admin" },
        { status: 400 }
      );
    }

    // Insert application
    const { data, error } = await supabase
      .from("admin_applications")
      .insert({
        user_id: user.id,
        requested_cities: requestedCities,
        reason: reason.trim(),
        social_proof: socialProof?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create application:", error);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: data.id,
    });
  } catch (error) {
    console.error("Admin application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
