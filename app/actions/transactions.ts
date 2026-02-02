"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import * as yup from "yup";
import { transactionSchema } from "@/app/lib/schemas";
import { completeOnboardingStep } from "@/app/actions/onboarding";

// Types for action state
export type TransactionActionState = {
    errors?: {
        description?: string[];
        amount?: string[];
        categoryId?: string[];
        date?: string[];
        isPaid?: string[];
        paidAt?: string[];
        _form?: string[];
    };
    success?: boolean;
    data?: any;
};

function serializeTransaction(transaction: any) {
    return {
        ...transaction,
        amount: transaction.amount.toNumber(),
        // Convert dates to ISO strings for client components
        date: transaction.date.toISOString(),
        paidAt: transaction.paidAt ? transaction.paidAt.toISOString() : null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        deletedAt: transaction.deletedAt ? transaction.deletedAt.toISOString() : null,
        category: transaction.category ? {
            id: transaction.category.id,
            workspaceId: transaction.category.workspaceId,
            ownerId: transaction.category.ownerId,
            name: transaction.category.name,
            type: transaction.category.type,
            color: transaction.category.color,
            createdAt: transaction.category.createdAt.toISOString(),
            updatedAt: transaction.category.updatedAt.toISOString(),
            deletedAt: transaction.category.deletedAt ? transaction.category.deletedAt.toISOString() : null,
        } : null,
    };
}


export async function createTransaction(
    workspaceId: string,
    _prevState: TransactionActionState | undefined,
    formData: FormData
): Promise<TransactionActionState> {
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
    const amount = formData.get("amount") as string;
    const categoryId = formData.get("categoryId") as string;
    const date = formData.get("date") as string;
    const isPaidValue = formData.get("isPaid");
    const paidAt = formData.get("paidAt") as string | null;

    // Convert values
    const isPaid = isPaidValue === "true" || isPaidValue === "on";
    const paidAtDate = paidAt && paidAt !== "" ? new Date(paidAt) : null;

    const rawData = {
        description,
        amount,
        categoryId,
        date,
        isPaid,
        paidAt: paidAtDate ? paidAtDate.toISOString() : null,
    };

    let validatedData;
    try {
        validatedData = await transactionSchema.validate(rawData, { abortEarly: false });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors: TransactionActionState["errors"] = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    // @ts-expect-error - Dynamic key assignment
                    errors[err.path] = [err.message];
                }
            });
            return { errors };
        }
        return { errors: { _form: ["Erro de validação"] } };
    }

    // Verify category exists and belongs to workspace
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!category || category.workspaceId !== workspaceId) {
        return { errors: { categoryId: ["Categoria inválida"] } };
    }

    try {
// ... inside createTransaction ...

        const transaction = await prisma.transaction.create({
            data: {
                workspaceId,
                ownerId: user.id,
                description: validatedData.description,
                amount: validatedData.amount,
                categoryId: validatedData.categoryId,
                date: new Date(validatedData.date),
                isPaid: validatedData.isPaid || false,
                paidAt: paidAtDate,
            },
        });
        
        // Complete onboarding step 5 (Create Transaction)
        await completeOnboardingStep(5);

        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        return { success: true, data: serializeTransaction(transaction) };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { errors: { _form: ["Erro ao criar transação"] } };
    }
}

export async function updateTransaction(
    workspaceId: string,
    transactionId: string,
    _prevState: TransactionActionState | undefined,
    formData: FormData
): Promise<TransactionActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify transaction ownership or workspace ownership
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { workspace: true }
    });

    if (!transaction) {
        return { errors: { _form: ["Transação não encontrada"] } };
    }

    if (transaction.workspaceId !== workspaceId) {
        return { errors: { _form: ["Transação não pertence a este workspace"] } };
    }

    // Check permission: Owner of transaction OR Owner of workspace
    const isTransactionOwner = transaction.ownerId === user.id;
    const isWorkspaceOwner = transaction.workspace.ownerId === user.id;

    if (!isTransactionOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    const description = formData.get("description") as string;
    const amount = formData.get("amount") as string;
    const categoryId = formData.get("categoryId") as string;
    const date = formData.get("date") as string;
    const isPaidValue = formData.get("isPaid");
    const paidAt = formData.get("paidAt") as string | null;

    // Convert values
    const isPaid = isPaidValue === "true" || isPaidValue === "on";
    const paidAtDate = paidAt && paidAt !== "" ? new Date(paidAt) : null;

    const rawData = {
        description,
        amount,
        categoryId,
        date,
        isPaid,
        paidAt: paidAtDate ? paidAtDate.toISOString() : null,
    };

    let validatedData;
    try {
        validatedData = await transactionSchema.validate(rawData, { abortEarly: false });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors: TransactionActionState["errors"] = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    // @ts-expect-error - Dynamic key assignment
                    errors[err.path] = [err.message];
                }
            });
            return { errors };
        }
        return { errors: { _form: ["Erro de validação"] } };
    }


    // Verify category exists and belongs to workspace
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!category || category.workspaceId !== workspaceId) {
        return { errors: { categoryId: ["Categoria inválida"] } };
    }

    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                description: validatedData.description,
                amount: validatedData.amount,
                categoryId: validatedData.categoryId,
                date: new Date(validatedData.date),
                isPaid: validatedData.isPaid ?? false,
                paidAt: validatedData.paidAt ? new Date(validatedData.paidAt) : null,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        return { success: true };
    } catch (error) {
        console.error("Error updating transaction:", error);
        return { errors: { _form: ["Erro ao atualizar transação"] } };
    }
}

export async function deleteTransaction(
    workspaceId: string,
    transactionId: string,
    _prevState: TransactionActionState | undefined,
    _formData: FormData
): Promise<TransactionActionState> {
    const user = await verifySession();
    if (!user) {
        return { errors: { _form: ["Não autorizado"] } };
    }

    // Verify transaction ownership or workspace ownership
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { workspace: true }
    });

    if (!transaction) {
        return { errors: { _form: ["Transação não encontrada"] } };
    }

    if (transaction.workspaceId !== workspaceId) {
        return { errors: { _form: ["Transação não pertence a este workspace"] } };
    }

    // Check permission: Owner of transaction OR Owner of workspace
    const isTransactionOwner = transaction.ownerId === user.id;
    const isWorkspaceOwner = transaction.workspace.ownerId === user.id;

    if (!isTransactionOwner && !isWorkspaceOwner) {
        return { errors: { _form: ["Permissão negada"] } };
    }

    try {
        // Soft delete by setting deletedAt
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                deletedAt: new Date(),
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return { errors: { _form: ["Erro ao excluir transação"] } };
    }
}

/**
 * Get all transactions for a workspace with optional filters
 * CACHED: Deduplicated within a single request (based on all arguments)
 */
export const getTransactions = cache(async (
    workspaceId: string,
    startDate?: string,
    endDate?: string,
    filter?: {
        categoryIds?: string[];
        type?: string;
    }
) => {
    const user = await verifySession();
    if (!user) return [];

    const where: any = {
        workspaceId,
        deletedAt: null,
    };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    } else if (startDate) {
        where.date = {
            gte: new Date(startDate),
        };
    } else if (endDate) {
        where.date = {
            lte: new Date(endDate),
        };
    }

    if (filter?.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = {
            in: filter.categoryIds
        };
    }

    if (filter?.type) {
        where.category = {
            type: Number(filter.type)
        };
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: { date: "desc" },
        });

        return transactions.map(serializeTransaction);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
});

/**
 * Get a single transaction by ID
 * CACHED: Deduplicated within a single request
 */
export const getTransaction = cache(async (transactionId: string) => {
    const user = await verifySession();
    if (!user) return null;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                category: true,
            },
        });

        if (!transaction || transaction.deletedAt) {
            return null;
        }

        return serializeTransaction(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return null;
    }
});

