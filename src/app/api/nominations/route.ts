import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nominations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { sanitizeInput, sanitizeUrl } from "@/utils/sanitize";

// POST /api/nominations - Submit a new spot nomination
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      name,
      cityId,
      types,
      description,
      googleMapsUrl,
      websiteUrl,
      twitterHandle,
      instagramHandle,
      linkedinUrl,
      lng,
      lat,
      vibes,
    } = body;

    // Validate required fields
    if (!name || !cityId || !types?.length || !description) {
      return NextResponse.json(
        { error: "Name, city, type, and description are required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name).slice(0, 100);
    const sanitizedDescription = sanitizeInput(description).slice(0, 500);
    const sanitizedTwitter = twitterHandle
      ? sanitizeInput(twitterHandle).replace(/^@/, "").slice(0, 50)
      : null;
    const sanitizedInstagram = instagramHandle
      ? sanitizeInput(instagramHandle).replace(/^@/, "").slice(0, 50)
      : null;

    const nominationId = `nom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(nominations).values({
      id: nominationId,
      name: sanitizedName,
      cityId,
      types,
      description: sanitizedDescription,
      lng: lng || null,
      lat: lat || null,
      vibes: vibes || [],
      googleMapsUrl: googleMapsUrl ? sanitizeUrl(googleMapsUrl) : null,
      websiteUrl: websiteUrl ? sanitizeUrl(websiteUrl) : null,
      twitterHandle: sanitizedTwitter,
      instagramHandle: sanitizedInstagram,
      linkedinUrl: linkedinUrl ? sanitizeUrl(linkedinUrl) : null,
      submittedBy: session?.user?.id || null,
      submitterEmail: null,
      status: "pending",
    });

    return NextResponse.json(
      { id: nominationId, message: "Nomination submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit nomination:", error);
    return NextResponse.json(
      { error: "Failed to submit nomination" },
      { status: 500 }
    );
  }
}
