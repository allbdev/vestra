"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { CATEGORY_TYPES } from "@/app/lib/consts";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "O nome é obrigatório").max(100),
    type: z.nativeEnum(CATEGORY_TYPES),
    color: z.string().max(7).optional(),
});

// Types for action state
export interface CategoryActionState {
    errors?: {
        name?: string[];
        type?: string[];
        color?: string[];
        _form?: string[];
    };
    success?: boolean;
    data?: any;
}

export async function createCategory(
    workspaceId: string,
    _prevState: CategoryActionState | undefined,
    formData: FormData
): Promise<CategoryActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify workspace access
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            users: {
                where: {
                    userId: user.id
                }
            }
        }
    });

    if (!workspace) {
        return { errors: { _form: ["Workspace não encontrado"] } };
    }

    // Allow owner or members
    const isMember = workspace.ownerId === user.id || workspace.users.length > 0;

    if (!isMember) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    const name = formData.get("name") as string;
    const typeValue = formData.get("type");
    const color = formData.get("color") as string;

    // Convert type to number
    const type = Number(typeValue);

    const validation = categorySchema.safeParse({
        name,
        type,
        color,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    try {
        const category = await prisma.category.create({
            data: {
                workspaceId,
                ownerId: user.id,
                name: validation.data.name,
                type: validation.data.type,
                color: validation.data.color ?? null,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/categories`);
        return { success: true, data: category };
    } catch (error) {
        console.error("Error creating category:", error);
        return { errors: { _form: ["Erro ao criar categoria"] } };
    }
}

export async function updateCategory(
    workspaceId: string,
    categoryId: string,
    _prevState: CategoryActionState | undefined,
    formData: FormData
): Promise<CategoryActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify category ownership or workspace ownership
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { workspace: true }
    });

    if (!category) {
        return { errors: { _form: ["Categoria não encontrada"] } };
    }

    // Check permission: Owner of category OR Owner of workspace
    const isCategoryOwner = category.ownerId === user.id;
    const isWorkspaceOwner = category.workspace.ownerId === user.id;

    if (!isCategoryOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    const name = formData.get("name") as string;
    const typeValue = formData.get("type");
    const color = formData.get("color") as string;

    const type = Number(typeValue);

    const validation = categorySchema.safeParse({
        name,
        type,
        color,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    try {
        await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: validation.data.name,
                type: validation.data.type,
                color: validation.data.color ?? null,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/categories`);
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        return { errors: { _form: ["Erro ao atualizar categoria"] } };
    }
}

export async function deleteCategory(
    workspaceId: string,
    categoryId: string,
    _prevState: CategoryActionState | undefined,
    _formData: FormData
): Promise<CategoryActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify category ownership or workspace ownership
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { workspace: true }
    });

    if (!category) {
        return { errors: { _form: ["Categoria não encontrada"] } };
    }

    // Check permission: Owner of category OR Owner of workspace
    const isCategoryOwner = category.ownerId === user.id;
    const isWorkspaceOwner = category.workspace.ownerId === user.id;

    if (!isCategoryOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    try {
        await prisma.category.delete({
            where: { id: categoryId },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/categories`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { errors: { _form: ["Erro ao excluir categoria"] } };
    }
}

export async function getCategories(workspaceId: string) {
    const user = await verifySession();
    if (!user) return [];

    try {
        const categories = await prisma.category.findMany({
            where: {
                workspaceId,
            },
            orderBy: { createdAt: "desc" },
        });
        
        // Convert Date to string for client components
        // Explicitly map all fields to avoid passing Prisma objects
        return categories.map(category => ({
            id: category.id,
            workspaceId: category.workspaceId,
            ownerId: category.ownerId,
            name: category.name,
            type: category.type,
            color: category.color,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt.toISOString(),
            deletedAt: category.deletedAt ? category.deletedAt.toISOString() : null,
        }));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
