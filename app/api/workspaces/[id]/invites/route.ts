import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";
import { sendWorkspaceInviteEmail } from "@/app/lib/email";

interface InviteUserRequest {
  email: string;
}

// POST /api/workspaces/[id]/invites - Invite a user to the workspace (owner only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: workspaceId } = await params;

    // Check if workspace exists and user is the owner
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

    if (workspace.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o proprietário pode convidar usuários" },
        { status: 403 }
      );
    }

    const body: InviteUserRequest = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de e-mail inválido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const invitedUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "Usuário com este e-mail não encontrado" },
        { status: 404 }
      );
    }

    // Check if user is already part of the workspace
    const existingWorkspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: invitedUser.id,
        deletedAt: null,
      },
    });

    if (existingWorkspaceUser) {
      return NextResponse.json(
        { error: "Este usuário já faz parte do workspace" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite (status !== rejected)
    const existingInvite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId: invitedUser.id,
        status: {
          not: "rejected",
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Este usuário já foi convidado para este workspace" },
        { status: 400 }
      );
    }

    // Delete any rejected invite for this workspace-user pair
    await db.workspaceInvite.deleteMany({
      where: {
        workspaceId,
        userId: invitedUser.id,
        status: "rejected",
      },
    });

    // Create new invite
    const invite = await db.workspaceInvite.create({
      data: {
        workspaceId,
        userId: invitedUser.id,
        status: "waiting",
      },
    });

    // Send invitation email
    const emailResult = await sendWorkspaceInviteEmail(
      normalizedEmail,
      workspace.name,
      workspaceId,
      invitedUser.id
    );

    if (!emailResult.success) {
      // Delete the invite if email fails
      await db.workspaceInvite.delete({
        where: { id: invite.id },
      });

      return NextResponse.json(
        { error: "Falha ao enviar e-mail de convite. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Convite enviado com sucesso",
        invite: {
          id: invite.id,
          workspaceId: invite.workspaceId,
          userId: invite.userId,
          status: invite.status,
          createdAt: invite.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Invite user error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

