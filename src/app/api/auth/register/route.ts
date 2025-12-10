import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sanitizeInput, sanitizeHandle } from "@/utils/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, handle, displayName } = body;

    // Validate required fields
    if (!email || !password || !handle) {
      return NextResponse.json(
        { error: "Email, password, and handle are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Sanitize inputs
    const sanitizedHandle = sanitizeHandle(handle);
    const sanitizedDisplayName = displayName
      ? sanitizeInput(displayName).slice(0, 100)
      : undefined;

    if (!sanitizedHandle) {
      return NextResponse.json(
        { error: "Invalid handle format" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      handle: sanitizedHandle,
      displayName: sanitizedDisplayName,
      provider: "email",
      passwordHash,
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
