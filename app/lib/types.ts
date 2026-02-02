
import { TransactionTemplate as PrismaTransactionTemplate, Transaction as PrismaTransaction } from "@/app/generated/prisma/client";

export type TransactionTemplate = Omit<PrismaTransactionTemplate, "baseAmount"> & { baseAmount: number };
export type Transaction = Omit<PrismaTransaction, "amount" | "paidAt" | "date"> & { amount: number, paidAt: string | null, date: string };