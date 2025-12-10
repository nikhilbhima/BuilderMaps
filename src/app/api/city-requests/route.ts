import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cityRequests } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { sanitizeInput } from "@/utils/sanitize";

// POST /api/city-requests - Submit a new city request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { cityName } = body;

    // Validate required fields
    if (!cityName || typeof cityName !== "string") {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedCityName = sanitizeInput(cityName).slice(0, 100);

    if (sanitizedCityName.length < 2) {
      return NextResponse.json(
        { error: "City name is too short" },
        { status: 400 }
      );
    }

    const requestId = `cityreq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(cityRequests).values({
      id: requestId,
      cityName: sanitizedCityName,
      requestedBy: session?.user?.id || null,
      status: "pending",
    });

    return NextResponse.json(
      { id: requestId, message: "City request submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit city request:", error);
    return NextResponse.json(
      { error: "Failed to submit city request" },
      { status: 500 }
    );
  }
}
