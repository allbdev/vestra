"use client";

import { useState, useActionState, useEffect } from "react";
import { Button, DateDisplay } from "@/app/components/ui";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { TransactionFormModal } from "@/app/components/transactions/TransactionFormModal";
import { deleteTransaction, createTransaction, updateTransaction, TransactionActionState } from "@/app/actions/transactions";
import { CATEGORY_TYPES } from "@/app/lib/consts";
import { Modal } from "@/app/components/ui/Modal";

interface Category {
    id: string;
    name: string;
    type: number;
    color: string | null;
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    categoryId: string | null;
    date: string;
    isPaid: boolean;
    paidAt: string | null;
    ownerId: string;
    category: Category | null;
}

interface TransactionsPageClientProps {
    transactions: Transaction[];
    categories: Category[];
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}

export default function TransactionsPageClient({
    transactions,
    categories,
    workspaceId,
    currentUserId,
    isWorkspaceOwner,
}: TransactionsPageClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create action wrapper
    const createAction = async (state: TransactionActionState | undefined, formData: FormData) => {
        return await createTransaction(workspaceId, state, formData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Transações</h1>
                    <p className="text-muted">Gerencie suas transações</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <AiOutlinePlus className="mr-2" />
                    Nova Transação
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted text-sm">
                        Nenhuma transação cadastrada
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {transactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                categories={categories}
                                workspaceId={workspaceId}
                                currentUserId={currentUserId}
                                isWorkspaceOwner={isWorkspaceOwner}
                            />
                        ))}
                    </div>
                )}
            </div>

            <TransactionFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                categories={categories}
                action={createAction}
            />
        </div>
    );
}

function TransactionItem({
    transaction,
    categories,
    workspaceId,
    currentUserId,
    isWorkspaceOwner
}: {
    transaction: Transaction;
    categories: Category[];
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const canManage = isWorkspaceOwner || transaction.ownerId === currentUserId;

    // Action wrappers
    const updateAction = async (state: TransactionActionState | undefined, formData: FormData) => {
        return await updateTransaction(workspaceId, transaction.id, state, formData);
    };

    const deleteAction = async (state: TransactionActionState | undefined, formData: FormData) => {
        return await deleteTransaction(workspaceId, transaction.id, state, formData);
    };

    // Delete handling with useActionState
    const [deleteState, handleDeleteAction, deletePending] = useActionState(deleteAction, undefined);

    // Close delete modal on success
    useEffect(() => {
        if (deleteState?.success) {
            setIsDeleteOpen(false);
        }
    }, [deleteState?.success]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const category = transaction.category;
    const isIncome = category?.type === CATEGORY_TYPES.INCOME;
    const amountColor = isIncome ? "text-emerald-500" : "text-red-500";

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium truncate">{transaction.description}</h3>
                    {transaction.isPaid && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            Pago
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span className={amountColor}>
                        {formatCurrency(transaction.amount)}
                    </span>
                    {category && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color || "#ccc" }}
                            />
                            <span>{category.name}</span>
                        </div>
                    )}
                    <DateDisplay date={transaction.date} />
                    {transaction.paidAt && (
                        <span className="text-xs">
                            Pago em: <DateDisplay date={transaction.paidAt} />
                        </span>
                    )}
                </div>
            </div>
            {canManage && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                        <AiOutlineEdit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <AiOutlineDelete className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Edit Modal */}
            {canManage && (
                <TransactionFormModal
                    isOpen={isEditOpen}
                    transactionToEdit={transaction}
                    categories={categories}
                    onClose={() => setIsEditOpen(false)}
                    action={updateAction}
                />
            )}

            {/* Delete Modal */}
            {canManage && (
                <Modal
                    title="Excluir Transação"
                    description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                >
                    <form action={handleDeleteAction}>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={deletePending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={deletePending}
                                loading={deletePending}
                            >
                                {deletePending ? "Excluindo..." : "Excluir"}
                            </Button>
                        </div>
                        {deleteState?.errors?._form && (
                            <div className="mt-2 text-sm text-red-500 text-right">
                                {deleteState.errors._form[0]}
                            </div>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    );
}


