
import { TransactionTemplate as PrismaTransactionTemplate, Transaction as PrismaTransaction, Category as PrismaCategory } from "@/app/generated/prisma/client";

export type TransactionTemplate = Omit<PrismaTransactionTemplate, "baseAmount"> & { baseAmount: number };
export type Transaction = Omit<PrismaTransaction, "amount" | "paidAt" | "date"> & { amount: number, paidAt: string | null, date: string };
export type Category = Omit<PrismaCategory, "createdAt" | "updatedAt" | "deletedAt"> & { createdAt: string, updatedAt: string, deletedAt: string | null };