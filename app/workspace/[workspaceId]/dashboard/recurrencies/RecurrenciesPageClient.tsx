"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/app/components/ui";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { RecurrencyFormModal } from "@/app/components/recurrencies/RecurrencyFormModal";
import { deleteTransactionTemplate, createTransactionTemplate, updateTransactionTemplate, TransactionTemplateActionState } from "@/app/actions/transaction-templates";
import { FREQUENCY_TYPES, CATEGORY_TYPES } from "@/app/lib/consts";
import { Modal } from "@/app/components/ui/Modal";

interface Category {
    id: string;
    name: string;
    type: number;
    color: string | null;
}

interface TransactionTemplate {
    id: string;
    description: string;
    baseAmount: number;
    categoryId: string | null;
    frequency: number | null;
    startDate: string;
    active: boolean;
    ownerId: string;
    category: Category | null;
}

interface RecurrenciesPageClientProps {
    templates: TransactionTemplate[];
    categories: Category[];
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}

const FREQUENCY_LABELS = {
    [FREQUENCY_TYPES.DAILY]: "Diária",
    [FREQUENCY_TYPES.WEEKLY]: "Semanal",
    [FREQUENCY_TYPES.MONTHLY]: "Mensal",
    [FREQUENCY_TYPES.YEARLY]: "Anual",
};

export default function RecurrenciesPageClient({
    templates,
    categories,
    workspaceId,
    currentUserId,
    isWorkspaceOwner,
}: RecurrenciesPageClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create action wrapper
    const createAction = async (state: TransactionTemplateActionState | undefined, formData: FormData) => {
        return await createTransactionTemplate(workspaceId, state, formData);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Recorrências</h1>
                    <p className="text-muted">Gerencie suas transações recorrentes</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <AiOutlinePlus className="mr-2" />
                    Nova Recorrência
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {templates.length === 0 ? (
                    <div className="p-8 text-center text-muted text-sm">
                        Nenhuma recorrência cadastrada
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {templates.map((template) => (
                            <RecurrencyItem
                                key={template.id}
                                template={template}
                                categories={categories}
                                workspaceId={workspaceId}
                                currentUserId={currentUserId}
                                isWorkspaceOwner={isWorkspaceOwner}
                            />
                        ))}
                    </div>
                )}
            </div>

            <RecurrencyFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                categories={categories}
                action={createAction}
            />
        </div>
    );
}

function RecurrencyItem({
    template,
    categories,
    workspaceId,
    currentUserId,
    isWorkspaceOwner
}: {
    template: TransactionTemplate;
    categories: Category[];
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const canManage = isWorkspaceOwner || template.ownerId === currentUserId;

    // Action wrappers
    const updateAction = async (state: TransactionTemplateActionState | undefined, formData: FormData) => {
        return await updateTransactionTemplate(workspaceId, template.id, state, formData);
    };

    const deleteAction = async (state: TransactionTemplateActionState | undefined, formData: FormData) => {
        return await deleteTransactionTemplate(workspaceId, template.id, state, formData);
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

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const category = template.category;
    const isIncome = category?.type === CATEGORY_TYPES.INCOME;
    const amountColor = isIncome ? "text-emerald-500" : "text-red-500";

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium truncate">{template.description}</h3>
                    {!template.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Inativa
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span className={amountColor}>
                        {formatCurrency(Number(template.baseAmount))}
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
                    {template.frequency && (
                        <span>{FREQUENCY_LABELS[template.frequency as keyof typeof FREQUENCY_LABELS]}</span>
                    )}
                    <span>{formatDate(template.startDate)}</span>
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
                <RecurrencyFormModal
                    isOpen={isEditOpen}
                    templateToEdit={template}
                    categories={categories}
                    onClose={() => setIsEditOpen(false)}
                    action={updateAction}
                />
            )}

            {/* Delete Modal */}
            {canManage && (
                <Modal
                    title="Excluir Recorrência"
                    description="Tem certeza que deseja excluir esta recorrência? Esta ação não pode ser desfeita. As transações já criadas não serão afetadas."
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

