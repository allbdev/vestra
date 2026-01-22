import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

// POST /api/workspaces/[id]/invites/[userId]/reject - Reject workspace invite
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
        { error: "Você não tem permissão para recusar este convite" },
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
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado ou já foi processado" },
        { status: 404 }
      );
    }

    // Update invite status to rejected
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "rejected" },
    });

    return NextResponse.json(
      {
        message: "Convite recusado com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reject invite error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

