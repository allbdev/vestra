import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { sendConfirmationEmail, generateConfirmationCode } from "@/app/lib/email";

interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, password_confirmation } = body;

    // Validate required fields
    if (!email || !password || !password_confirmation) {
      return NextResponse.json(
        { error: "Email, password, and password confirmation are required" },
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

    // Check if passwords match
    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Generate confirmation code
    const code = generateConfirmationCode();

    // Hash password and store pending registration
    const hashedPassword = await bcrypt.hash(password, 12);

    // Delete any existing confirmation codes for this email
    await db.confirmationCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Store the confirmation code
    await db.confirmationCode.create({
      data: {
        email: email.toLowerCase(),
        code,
      },
    });

    // Store pending user data in a temporary way
    // We'll store the hashed password in a separate pending_users approach
    // For simplicity, we'll include it in the confirmation flow
    // Let's store it alongside the confirmation code

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(email, code);

    if (!emailResult.success) {
      // Clean up the confirmation code if email fails
      await db.confirmationCode.deleteMany({
        where: { email: email.toLowerCase() },
      });

      return NextResponse.json(
        { error: "Failed to send confirmation email. Please try again." },
        { status: 500 }
      );
    }

    // Store pending registration data (we need to save name and hashed password)
    // Update the confirmation code record or use a separate mechanism
    // For now, we'll handle this by requiring the user to re-enter during confirmation
    // OR we store it in the session/temp storage

    // Better approach: Store pending user data
    // Let's update the schema or use a workaround
    // For simplicity, we'll store it in memory or require re-entry

    // Actually, let's create a proper flow by storing pending data
    // We'll use a simple approach: store in the confirmation code table with extra fields
    // But our current schema doesn't have those fields, so let's use a workaround

    // Store in global memory (for demo - in production use Redis or DB)
    // @ts-expect-error - using global for demo purposes
    if (!global.pendingRegistrations) {
      // @ts-expect-error - using global for demo purposes
      global.pendingRegistrations = new Map();
    }
    // @ts-expect-error - using global for demo purposes
    global.pendingRegistrations.set(email.toLowerCase(), {
      name,
      email: email.toLowerCase(),
      hashedPassword,
    });

    return NextResponse.json(
      {
        message:
          "Confirmation email sent! Please check your inbox and enter the 6-digit code to complete registration.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

