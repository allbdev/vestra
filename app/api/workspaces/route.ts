import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";

interface CreateWorkspaceRequest {
  name: string;
}

// GET /api/workspaces - List all workspaces the user has access to
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Get workspaces where user is owner or member
    const workspaces = await db.workspace.findMany({
      where: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform response to include isOwner flag
    const workspacesWithRole = workspaces.map((workspace) => ({
      ...workspace,
      isOwner: workspace.ownerId === user.id,
    }));

    return NextResponse.json({ workspaces: workspacesWithRole }, { status: 200 });
  } catch (error: any) {
    console.error("List workspaces error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body: CreateWorkspaceRequest = await request.json();
    const { name } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome do workspace é obrigatório" },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: "Nome do workspace deve ter no máximo 255 caracteres" },
        { status: 400 }
      );
    }

    // Create workspace and add owner as a member
    const workspace = await db.workspace.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
        users: {
          create: {
            userId: user.id,
          },
        },
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
        message: "Workspace criado com sucesso",
        workspace: {
          ...workspace,
          isOwner: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create workspace error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

