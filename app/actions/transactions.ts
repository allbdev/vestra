"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { z } from "zod";

const transactionSchema = z.object({
    description: z.string().min(1, "A descrição é obrigatória").max(255),
    amount: z.string().refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "O valor deve ser um número positivo"
    ),
    categoryId: z.string().uuid("Categoria inválida"),
    date: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Data inválida"
    ),
    isPaid: z.boolean().optional(),
    paidAt: z.string().optional().nullable(),
});

// Types for action state
export interface TransactionActionState {
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

    const validation = transactionSchema.safeParse({
        description,
        amount,
        categoryId,
        date,
        isPaid,
        paidAt: paidAtDate ? paidAtDate.toISOString() : null,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    // Verify category exists and belongs to workspace
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!category || category.workspaceId !== workspaceId) {
        return { errors: { categoryId: ["Categoria inválida"] } };
    }

    try {
        const transaction = await prisma.transaction.create({
            data: {
                workspaceId,
                ownerId: user.id,
                description: validation.data.description,
                amount: validation.data.amount,
                categoryId: validation.data.categoryId,
                date: new Date(validation.data.date),
                isPaid: validation.data.isPaid ?? false,
                paidAt: paidAtDate,
            },
        });

        revalidatePath(`/workspace/${workspaceId}/dashboard/transactions`);
        return { success: true, data: transaction };
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

    const validation = transactionSchema.safeParse({
        description,
        amount,
        categoryId,
        date,
        isPaid,
        paidAt: paidAtDate ? paidAtDate.toISOString() : null,
    });

    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
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
                description: validation.data.description,
                amount: validation.data.amount,
                categoryId: validation.data.categoryId,
                date: new Date(validation.data.date),
                isPaid: validation.data.isPaid ?? false,
                paidAt: paidAtDate,
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

export async function getTransactions(workspaceId: string) {
    const user = await verifySession();
    if (!user) return [];

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                workspaceId,
                deletedAt: null,
            },
            include: {
                category: true,
            },
            orderBy: { date: "desc" },
        });
        
        // Convert Decimal to number and Date to string for client components
        // Explicitly map all fields to avoid passing Prisma objects
        return transactions.map(transaction => ({
            id: transaction.id,
            workspaceId: transaction.workspaceId,
            ownerId: transaction.ownerId,
            categoryId: transaction.categoryId,
            templateId: transaction.templateId,
            description: transaction.description,
            amount: Number(transaction.amount),
            date: transaction.date.toISOString(),
            isPaid: transaction.isPaid,
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
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function getTransaction(transactionId: string) {
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

        // Convert Decimal to number and Date to string for client components
        // Explicitly map all fields to avoid passing Prisma objects
        return {
            id: transaction.id,
            workspaceId: transaction.workspaceId,
            ownerId: transaction.ownerId,
            categoryId: transaction.categoryId,
            templateId: transaction.templateId,
            description: transaction.description,
            amount: Number(transaction.amount),
            date: transaction.date.toISOString(),
            isPaid: transaction.isPaid,
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
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return null;
    }
}

