import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { authenticateRequest } from "@/app/lib/auth";
import { checkWorkspaceAccess } from "@/app/lib/workspace";

interface UpdateCategoryRequest {
  name?: string;
  type?: "revenue" | "expense";
  color?: string;
  icon?: string;
}

// GET /api/workspaces/[id]/categories/[categoryId] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: workspaceId, categoryId } = await params;

    // Check workspace access
    const access = await checkWorkspaceAccess(workspaceId, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    const category = await db.category.findFirst({
      where: {
        id: categoryId,
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
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        category: {
          ...category,
          isOwner: category.ownerId === user.id,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get category error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/[id]/categories/[categoryId] - Update a category (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: workspaceId, categoryId } = await params;

    // Check workspace access
    const access = await checkWorkspaceAccess(workspaceId, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    // Check if category exists
    const existingCategory = await db.category.findFirst({
      where: {
        id: categoryId,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Only the owner can update the category
    if (existingCategory.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o criador da categoria pode editá-la" },
        { status: 403 }
      );
    }

    const body: UpdateCategoryRequest = await request.json();
    const { name, type, color, icon } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Nome da categoria não pode estar vazio" },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          { error: "Nome da categoria deve ter no máximo 100 caracteres" },
          { status: 400 }
        );
      }
    }

    // Validate type if provided
    if (type !== undefined && type !== "revenue" && type !== "expense") {
      return NextResponse.json(
        { error: "Tipo deve ser 'revenue' ou 'expense'" },
        { status: 400 }
      );
    }

    // Validate color format if provided
    if (color !== undefined && color !== null && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: "Cor deve estar no formato hexadecimal (#RRGGBB)" },
        { status: 400 }
      );
    }

    // Validate icon length if provided
    if (icon !== undefined && icon !== null && icon.length > 50) {
      return NextResponse.json(
        { error: "Ícone deve ter no máximo 50 caracteres" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      name?: string;
      type?: string | null;
      color?: string | null;
      icon?: string | null;
    } = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (type !== undefined) {
      updateData.type = type || null;
    }
    if (color !== undefined) {
      updateData.color = color || null;
    }
    if (icon !== undefined) {
      updateData.icon = icon || null;
    }

    // Update category
    const category = await db.category.update({
      where: { id: categoryId },
      data: updateData,
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
        message: "Categoria atualizada com sucesso",
        category: {
          ...category,
          isOwner: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id]/categories/[categoryId] - Delete a category (owner only, soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: workspaceId, categoryId } = await params;

    // Check workspace access
    const access = await checkWorkspaceAccess(workspaceId, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Workspace não encontrado" },
        { status: 404 }
      );
    }

    // Check if category exists
    const existingCategory = await db.category.findFirst({
      where: {
        id: categoryId,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Only the owner can delete the category
    if (existingCategory.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o criador da categoria pode excluí-la" },
        { status: 403 }
      );
    }

    // Check if category is being used by transactions or templates
    const [transactionsCount, templatesCount] = await Promise.all([
      db.transaction.count({
        where: {
          categoryId: categoryId,
          deletedAt: null,
        },
      }),
      db.transactionTemplate.count({
        where: {
          categoryId: categoryId,
          deletedAt: null,
        },
      }),
    ]);

    if (transactionsCount > 0 || templatesCount > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir a categoria pois ela está sendo utilizada em transações ou templates",
          details: {
            transactions: transactionsCount,
            templates: templatesCount,
          },
        },
        { status: 400 }
      );
    }

    // Soft delete category
    await db.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      {
        message: "Categoria excluída com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

