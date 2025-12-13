import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { validateOrigin, csrfError } from "@/utils/csrf";

const VALID_REPORT_TYPES = [
  "wrong_address",
  "permanently_closed",
  "temporarily_closed",
  "wrong_info",
  "fake_spam",
  "duplicate",
  "other",
];

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

  const supabase = await createClient();

  // User must be logged in to report
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to report a spot" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate report type
    const reportType = body.reportType;
    if (!reportType || !VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Validate details (optional but max 500 chars)
    const details = body.details?.trim().slice(0, 500) || null;

    // Check if user already has a pending report for this spot
    const { data: existingReport } = await supabase
      .from("spot_reports")
      .select("id")
      .eq("spot_id", spotId)
      .eq("reported_by", user.id)
      .eq("status", "pending")
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: "You already have a pending report for this spot" },
        { status: 400 }
      );
    }

    // Verify spot exists
    const { data: spot } = await supabase
      .from("spots")
      .select("id")
      .eq("id", spotId)
      .single();

    if (!spot) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    // Insert report
    const { error } = await supabase.from("spot_reports").insert({
      spot_id: spotId,
      reported_by: user.id,
      report_type: reportType,
      details,
      status: "pending",
    });

    if (error) {
      console.error("Failed to insert report:", error);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
