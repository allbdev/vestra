"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { z } from "zod";

const transactionTemplateSchema = z.object({
    description: z.string().min(1, "A descrição é obrigatória").max(255),
    baseAmount: z.string().refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "O valor deve ser um número positivo"
    ),
    categoryId: z.string().uuid("Categoria inválida").optional().nullable().or(z.literal("")),
    frequency: z.nativeEnum(FREQUENCY_TYPES).optional().nullable(),
    startDate: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Data inválida"
    ),
    active: z.boolean().optional(),
});

// Types for action state
export interface TransactionTemplateActionState {
    errors?: {
        description?: string[];
        baseAmount?: string[];
        categoryId?: string[];
        frequency?: string[];
        startDate?: string[];
        active?: string[];
        _form?: string[];
    };
    success?: boolean;
    data?: any;
}

export async function createTransactionTemplate(
    workspaceId: string,
    _prevState: TransactionTemplateActionState | undefined,
    formData: FormData
): Promise<TransactionTemplateActionState> {
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

    const description = formData.get("description") as string;
    const baseAmount = formData.get("baseAmount") as string;
    const categoryId = formData.get("categoryId") as string;
    const frequencyValue = formData.get("frequency");
    const startDate = formData.get("startDate") as string;
    const activeValue = formData.get("active");

    // Convert values
    const frequency = frequencyValue ? Number(frequencyValue) : null;
    const active = activeValue === "true" || activeValue === "on";

    const validation = transactionTemplateSchema.safeParse({
        description,
        baseAmount,
        categoryId: categoryId || null,
        frequency: frequency ? frequency : null,
        startDate,
        active,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    try {
        const template = await prisma.transactionTemplate.create({
            data: {
                workspaceId,
                ownerId: user.id,
                description: validation.data.description,
                baseAmount: validation.data.baseAmount,
                categoryId: validation.data.categoryId && validation.data.categoryId !== "" ? validation.data.categoryId : null,
                frequency: validation.data.frequency ?? null,
                startDate: new Date(validation.data.startDate),
                active: validation.data.active ?? true,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/recurrencies`);
        return { success: true, data: template };
    } catch (error) {
        console.error("Error creating transaction template:", error);
        return { errors: { _form: ["Erro ao criar recorrência"] } };
    }
}

export async function updateTransactionTemplate(
    workspaceId: string,
    templateId: string,
    _prevState: TransactionTemplateActionState | undefined,
    formData: FormData
): Promise<TransactionTemplateActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify template ownership or workspace ownership
    const template = await prisma.transactionTemplate.findUnique({
        where: { id: templateId },
        include: { workspace: true }
    });

    if (!template) {
        return { errors: { _form: ["Recorrência não encontrada"] } };
    }

    // Check permission: Owner of template OR Owner of workspace
    const isTemplateOwner = template.ownerId === user.id;
    const isWorkspaceOwner = template.workspace.ownerId === user.id;

    if (!isTemplateOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    const description = formData.get("description") as string;
    const baseAmount = formData.get("baseAmount") as string;
    const categoryId = formData.get("categoryId") as string;
    const frequencyValue = formData.get("frequency");
    const startDate = formData.get("startDate") as string;
    const activeValue = formData.get("active");

    // Convert values
    const frequency = frequencyValue ? Number(frequencyValue) : null;
    const active = activeValue === "true" || activeValue === "on";

    const validation = transactionTemplateSchema.safeParse({
        description,
        baseAmount,
        categoryId: categoryId || null,
        frequency: frequency ? frequency : null,
        startDate,
        active,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    try {
        await prisma.transactionTemplate.update({
            where: { id: templateId },
            data: {
                description: validation.data.description,
                baseAmount: validation.data.baseAmount,
                categoryId: validation.data.categoryId && validation.data.categoryId !== "" ? validation.data.categoryId : null,
                frequency: validation.data.frequency ?? null,
                startDate: new Date(validation.data.startDate),
                active: validation.data.active ?? true,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/recurrencies`);
        return { success: true };
    } catch (error) {
        console.error("Error updating transaction template:", error);
        return { errors: { _form: ["Erro ao atualizar recorrência"] } };
    }
}

export async function deleteTransactionTemplate(
    workspaceId: string,
    templateId: string,
    _prevState: TransactionTemplateActionState | undefined,
    _formData: FormData
): Promise<TransactionTemplateActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify template ownership or workspace ownership
    const template = await prisma.transactionTemplate.findUnique({
        where: { id: templateId },
        include: { workspace: true }
    });

    if (!template) {
        return { errors: { _form: ["Recorrência não encontrada"] } };
    }

    // Check permission: Owner of template OR Owner of workspace
    const isTemplateOwner = template.ownerId === user.id;
    const isWorkspaceOwner = template.workspace.ownerId === user.id;

    if (!isTemplateOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    try {
        // Soft delete by setting deletedAt
        await prisma.transactionTemplate.update({
            where: { id: templateId },
            data: {
                deletedAt: new Date(),
                active: false,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/recurrencies`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting transaction template:", error);
        return { errors: { _form: ["Erro ao excluir recorrência"] } };
    }
}

export async function getTransactionTemplates(workspaceId: string) {
    const user = await verifySession();
    if (!user) return [];

    try {
        const templates = await prisma.transactionTemplate.findMany({
            where: {
                workspaceId,
                deletedAt: null,
            },
            include: {
                category: true,
            },
            orderBy: { createdAt: "desc" },
        });
        
        // Convert Decimal to number and Date to string for client components
        return templates.map(template => ({
            ...template,
            baseAmount: Number(template.baseAmount),
            startDate: template.startDate.toISOString(),
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
            deletedAt: template.deletedAt ? template.deletedAt.toISOString() : null,
        }));
    } catch (error) {
        console.error("Error fetching transaction templates:", error);
        return [];
    }
}

