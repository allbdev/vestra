import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "./db";

const TOKEN_EXPIRY_DAYS = 30;

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
  return expiry;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Authenticates a request and returns the user if valid
 * Returns null if authentication fails
 * This is for use in Route Handlers (API routes)
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // Get session token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const sessionToken =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("sessionToken")?.value;

    if (!sessionToken) {
      return null;
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await db.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    // Check if user exists
    if (!session.user) {
      // Clean up orphaned session
      await db.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    // Check if user is deleted
    if (session.user.deletedAt) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
