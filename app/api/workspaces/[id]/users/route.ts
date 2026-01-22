import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

interface AddUserRequest {
  email: string;
}

// GET /api/workspaces/[id]/users - List users in a workspace
export async function GET(
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

    // Check if user has access to this workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          {
            users: {
              some: {
                userId: user.id,
                deletedAt: null,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    // Get all users in workspace
    const workspaceUsers = await db.workspaceUser.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      {
        users: workspaceUsers.map((wu) => ({
          ...wu.user,
          isOwner: wu.userId === workspace.ownerId,
          joinedAt: wu.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("List workspace users error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/[id]/users - Add a user to workspace (owner only)
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
        { error: "Apenas o proprietário pode adicionar usuários ao workspace" },
        { status: 403 }
      );
    }

    const body: AddUserRequest = await request.json();
    const { email } = body;

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      );
    }

    // Find user by email
    const userToAdd = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "Usuário não encontrado com este e-mail" },
        { status: 404 }
      );
    }

    if (userToAdd.deletedAt) {
      return NextResponse.json(
        { error: "Usuário não disponível" },
        { status: 404 }
      );
    }

    // Check if user is already in workspace
    const existingWorkspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: userToAdd.id,
      },
    });

    if (existingWorkspaceUser) {
      if (existingWorkspaceUser.deletedAt) {
        // Reactivate the user
        await db.workspaceUser.update({
          where: { id: existingWorkspaceUser.id },
          data: { deletedAt: null },
        });

        return NextResponse.json(
          {
            message: "Usuário reativado no workspace com sucesso",
            user: {
              id: userToAdd.id,
              name: userToAdd.name,
              email: userToAdd.email,
              isOwner: false,
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Usuário já faz parte deste workspace" },
        { status: 400 }
      );
    }

    // Add user to workspace
    await db.workspaceUser.create({
      data: {
        workspaceId,
        userId: userToAdd.id,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário adicionado ao workspace com sucesso",
        user: {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email,
          isOwner: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add workspace user error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

