import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";
import { storageKeys } from "@/app/lib/consts";

const SESSION_COOKIE_NAME = storageKeys.sessionToken;
const TOKEN_EXPIRY_DAYS = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  const { workspaceId, userId } = await params;

  try {
    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
      include: {
        workspace: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Check if workspace still exists and is not deleted
    if (invite.workspace.deletedAt) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Check if user exists and is not deleted
    if (!invite.user || invite.user.deletedAt) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Create a session for the user
    const sessionToken = generateSessionToken();
    const expiresAt = getTokenExpiry();

    await db.session.create({
      data: {
        userId: invite.user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    // Create redirect response
    const response = NextResponse.redirect(
      new URL(`/workspace/${workspaceId}/invite/${userId}`, request.url)
    );

    // Set the cookie directly on the response
    const cookieExpiry = new Date();
    cookieExpiry.setDate(cookieExpiry.getDate() + TOKEN_EXPIRY_DAYS);

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: cookieExpiry,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Create invite session error:", error);
    return NextResponse.redirect(new URL("/404", request.url));
  }
}
