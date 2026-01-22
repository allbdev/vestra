import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";
import { checkWorkspaceAccess } from "@/app/lib/workspace";

interface CreateCategoryRequest {
  name: string;
  type?: "revenue" | "expense";
  color?: string;
  icon?: string;
}

// GET /api/workspaces/[id]/categories - List all categories in a workspace
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

    // Check workspace access
    const access = await checkWorkspaceAccess(workspaceId, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    const categories = await db.category.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add isOwner flag to each category
    const categoriesWithRole = categories.map((category) => ({
      ...category,
      isOwner: category.ownerId === user.id,
    }));

    return NextResponse.json({ categories: categoriesWithRole }, { status: 200 });
  } catch (error: any) {
    console.error("List categories error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/[id]/categories - Create a new category
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

    // Check workspace access
    const access = await checkWorkspaceAccess(workspaceId, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    const body: CreateCategoryRequest = await request.json();
    const { name, type, color, icon } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Nome da categoria deve ter no máximo 100 caracteres" },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && type !== "revenue" && type !== "expense") {
      return NextResponse.json(
        { error: "Tipo deve ser 'revenue' ou 'expense'" },
        { status: 400 }
      );
    }

    // Validate color format if provided (hex color)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: "Cor deve estar no formato hexadecimal (#RRGGBB)" },
        { status: 400 }
      );
    }

    // Validate icon length if provided
    if (icon && icon.length > 50) {
      return NextResponse.json(
        { error: "Ícone deve ter no máximo 50 caracteres" },
        { status: 400 }
      );
    }

    // Create category
    const category = await db.category.create({
      data: {
        workspaceId,
        ownerId: user.id,
        name: name.trim(),
        type: type || null,
        color: color || null,
        icon: icon || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Categoria criada com sucesso",
        category: {
          ...category,
          isOwner: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

