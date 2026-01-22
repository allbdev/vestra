import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";

// GET /api/workspaces/[id]/invites/[userId] - Get invite details and create session for user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: workspaceId, userId } = await params;

    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
      include: {
        workspace: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado ou já foi processado" },
        { status: 404 }
      );
    }

    // Check if workspace still exists and is not deleted
    if (invite.workspace.deletedAt) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    // Check if user is already part of the workspace
    const existingWorkspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
    });

    if (existingWorkspaceUser) {
      // Update invite status to accepted since user is already in workspace
      await db.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      return NextResponse.json(
        { error: "Você já faz parte deste workspace" },
        { status: 400 }
      );
    }

    // Create a session for the user so they can view the invite page
    const sessionToken = generateSessionToken();
    const expiresAt = getTokenExpiry();

    await db.session.create({
      data: {
        userId: invite.user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        invite: {
          id: invite.id,
          workspaceId: invite.workspaceId,
          userId: invite.userId,
          status: invite.status,
          createdAt: invite.createdAt,
          workspace: {
            id: invite.workspace.id,
            name: invite.workspace.name,
            owner: invite.workspace.owner,
          },
          user: invite.user,
        },
        sessionToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get invite error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

