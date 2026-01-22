import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

// DELETE /api/workspaces/[id]/users/[userId] - Remove a user from workspace (owner only)
export async function DELETE(
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

    const { id: workspaceId, userId: targetUserId } = await params;

    // Check if workspace exists
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    // Cannot remove the owner from workspace
    if (targetUserId === workspace.ownerId) {
      return NextResponse.json(
        { error: "O proprietário não pode ser removido do workspace" },
        { status: 400 }
      );
    }

    // Only owner can remove other users, or user can remove themselves
    if (workspace.ownerId !== user.id && user.id !== targetUserId) {
      return NextResponse.json(
        { error: "Você não tem permissão para remover este usuário" },
        { status: 403 }
      );
    }

    // Find workspace user
    const workspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: targetUserId,
        deletedAt: null,
      },
    });

    if (!workspaceUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado neste workspace" },
        { status: 404 }
      );
    }

    // Soft delete workspace user
    await db.workspaceUser.update({
      where: { id: workspaceUser.id },
      data: { deletedAt: new Date() },
    });

    const message = user.id === targetUserId
      ? "Você saiu do workspace com sucesso"
      : "Usuário removido do workspace com sucesso";

    return NextResponse.json(
      { message },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Remove workspace user error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

