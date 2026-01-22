import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

interface UpdateWorkspaceRequest {
  name?: string;
}

// GET /api/workspaces/[id] - Get a specific workspace
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

    // Find workspace where user is owner or member
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          where: {
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
        },
        _count: {
          select: {
            categories: {
              where: { deletedAt: null },
            },
            transactions: {
              where: { deletedAt: null },
            },
            transactionTemplates: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        workspace: {
          ...workspace,
          isOwner: workspace.ownerId === user.id,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get workspace error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/[id] - Update a workspace (owner only)
export async function PUT(
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
    const existingWorkspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    if (existingWorkspace.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o proprietário pode editar o workspace" },
        { status: 403 }
      );
    }

    const body: UpdateWorkspaceRequest = await request.json();
    const { name } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Nome do workspace não pode estar vazio" },
          { status: 400 }
        );
      }

      if (name.length > 255) {
        return NextResponse.json(
          { error: "Nome do workspace deve ter no máximo 255 caracteres" },
          { status: 400 }
        );
      }
    }

    // Update workspace
    const workspace = await db.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name?.trim(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          where: {
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
        },
      },
    });

    return NextResponse.json(
      {
        message: "Workspace atualizado com sucesso",
        workspace: {
          ...workspace,
          isOwner: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update workspace error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id] - Delete a workspace (owner only, soft delete)
export async function DELETE(
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
    const existingWorkspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    if (existingWorkspace.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o proprietário pode excluir o workspace" },
        { status: 403 }
      );
    }

    // Soft delete workspace
    await db.workspace.update({
      where: { id: workspaceId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Workspace excluído com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete workspace error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

