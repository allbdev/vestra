"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Generate transaction dates based on frequency and start date
 * Rules:
 * - Monthly: one transaction for each month left in the year
 * - Weekly: one transaction for each week left in the month (same weekday)
 * - Daily: one transaction for each day left in the current week
 * - Never creates past transactions
 */
function serializeTransactionTemplate(template: any) {
    return {
        id: template.id,
        workspaceId: template.workspaceId,
        ownerId: template.ownerId,
        categoryId: template.categoryId,
        description: template.description,
        baseAmount: Number(template.baseAmount),
        frequency: template.frequency,
        startDate: template.startDate.toISOString(),
        active: template.active,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        deletedAt: template.deletedAt ? template.deletedAt.toISOString() : null,
        category: template.category ? {
            id: template.category.id,
            workspaceId: template.category.workspaceId,
            ownerId: template.category.ownerId,
            name: template.category.name,
            type: template.category.type,
            color: template.category.color,
            createdAt: template.category.createdAt.toISOString(),
            updatedAt: template.category.updatedAt.toISOString(),
            deletedAt: template.category.deletedAt ? template.category.deletedAt.toISOString() : null,
        } : null,
    };
}

function generateTransactionDates(startDate: Date, frequency: number): Date[] {
    const dates: Date[] = [];
    const today = dayjs.utc().startOf("day");
    const start = dayjs.utc(startDate);

    // Check if start date is the last day of its month
    const isLastDayOfStartMonth = start.date() === start.endOf("month").date();

    if (frequency === FREQUENCY_TYPES.MONTHLY) {
        // Create one transaction for each month left in the year
        const startMonth = start.month();
        const startYear = start.year();

        for (let month = startMonth; month <= 11; month++) {
            let transactionDate: dayjs.Dayjs;

            if (isLastDayOfStartMonth) {
                // Use the last day of each subsequent month
                transactionDate = dayjs.utc().year(startYear).month(month).endOf("month").startOf("day");
            } else {
                // Try to use the same day, dayjs handles overflow automatically
                transactionDate = dayjs.utc().year(startYear).month(month).date(start.date());

                // If the day doesn't exist in the target month, use the last day
                if (transactionDate.date() !== start.date()) {
                    transactionDate = dayjs.utc().year(startYear).month(month).endOf("month").startOf("day");
                }
            }

            // Don't create past transactions
            if (!transactionDate.isBefore(today)) {
                dates.push(transactionDate.toDate());
            }
        }
    } else if (frequency === FREQUENCY_TYPES.WEEKLY) {
        // Create one transaction for each week left in the month (same weekday)
        let currentDate = start;
        const startMonth = start.month();

        while (currentDate.month() === startMonth) {
            // Don't create past transactions
            if (!currentDate.isBefore(today)) {
                dates.push(currentDate.toDate());
            }

            // Move to the next week (add 7 days)
            currentDate = currentDate.add(7, "day");
        }
    } else if (frequency === FREQUENCY_TYPES.DAILY) {
        // Create one transaction for each day left in the current week
        // Week ends on Saturday (day 6)
        let currentDate = start;

        // Continue until we reach Saturday (inclusive)
        while (true) {
            // Don't create past transactions
            if (!currentDate.isBefore(today)) {
                dates.push(currentDate.toDate());
            }

            // If we're on Saturday (day 6), we're done
            if (currentDate.day() === 6) {
                break;
            }

            // Move to the next day
            currentDate = currentDate.add(1, "day");
        }
    }

    return dates;
}

/**
 * Create transactions for a template based on its frequency
 */
async function createTransactionsForTemplate(
    templateId: string,
    workspaceId: string,
    ownerId: string,
    description: string,
    amount: string,
    categoryId: string | null,
    startDate: Date,
    frequency: number | null
): Promise<void> {
    if (!frequency) return;

    const dates = generateTransactionDates(startDate, frequency);

    if (dates.length === 0) return;

    const transactionsData = dates.map(date => ({
        workspaceId,
        ownerId,
        templateId,
        description,
        amount,
        categoryId,
        date,
        isPaid: false,
    }));

    await prisma.transaction.createMany({
        data: transactionsData,
    });
}

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

        // Create transactions based on the template frequency
        const resolvedCategoryId = validation.data.categoryId && validation.data.categoryId !== ""
            ? validation.data.categoryId
            : null;

        await createTransactionsForTemplate(
            template.id,
            workspaceId,
            user.id,
            validation.data.description,
            validation.data.baseAmount,
            resolvedCategoryId,
            new Date(validation.data.startDate),
            validation.data.frequency ?? null
        );

        revalidatePath(`/workspace/${workspaceId}/dashboard/recurrencies`);
        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        return { success: true, data: serializeTransactionTemplate(template) };
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

/**
 * Get all transaction templates for a workspace
 * CACHED: Deduplicated within a single request
 */
export const getTransactionTemplates = cache(async (workspaceId: string) => {
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
        // Explicitly map all fields to avoid passing Prisma objects
        return templates.map(serializeTransactionTemplate);
    } catch (error) {
        console.error("Error fetching transaction templates:", error);
        return [];
    }
});

