import { cookies } from "next/headers";
import { db } from "./db";
import { AuthenticatedUser } from "./auth";
import { storageKeys } from "./consts";

const SESSION_COOKIE_NAME = storageKeys.sessionToken;
const TOKEN_EXPIRY_DAYS = 30;

/**
 * Get session token from cookies
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * Set session token in cookie
 */
export async function setSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Clear session token from cookie
 */
export async function clearSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verify session and return authenticated user
 * This is for use in Server Components and Server Actions
 */
export async function verifySession(): Promise<AuthenticatedUser | null> {
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return null;
  }

  try {

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
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Get user with workspaces for Server Components
 */
export interface UserWithWorkspaces extends AuthenticatedUser {
  workspaces: Array<{
    id: string;
    name: string;
  }>;
}

export async function getUserWithWorkspaces(): Promise<UserWithWorkspaces | null> {
  const user = await verifySession();

  if (!user) {
    return null;
  }

  const workspaceUsers = await db.workspaceUser.findMany({
    where: {
      userId: user.id,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    ...user,
    workspaces: workspaceUsers.map((wu) => ({
      id: wu.workspace.id,
      name: wu.workspace.name,
    })),
  };
}

