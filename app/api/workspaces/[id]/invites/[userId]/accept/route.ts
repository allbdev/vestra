import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

// POST /api/workspaces/[id]/invites/[userId]/accept - Accept workspace invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: workspaceId, userId } = await params;

    // Verify that the authenticated user is the one being invited
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Você não tem permissão para aceitar este convite" },
        { status: 403 }
      );
    }

    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
      include: {
        workspace: true,
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
      // Update invite status to accepted
      await db.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      return NextResponse.json(
        { message: "Você já faz parte deste workspace", workspaceId },
        { status: 200 }
      );
    }

    // Add user to workspace
    await db.workspaceUser.create({
      data: {
        workspaceId,
        userId,
      },
    });

    // Update invite status to accepted
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });

    return NextResponse.json(
      {
        message: "Convite aceito com sucesso",
        workspaceId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

