"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/components/ui";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { CategoryFormModal } from "@/app/components/categories/CategoryFormModal";
import { deleteCategory, createCategory, updateCategory, CategoryActionState } from "@/app/actions/categories";
import { CATEGORY_TYPES } from "@/app/lib/consts";
import { Modal } from "@/app/components/ui/Modal";

interface Category {
    id: string;
    name: string;
    type: number;
    color: string | null;
    ownerId: string;
}

interface CategoriesPageClientProps {
    categories: Category[];
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}

export default function CategoriesPageClient({
    categories,
    workspaceId,
    currentUserId,
    isWorkspaceOwner,
}: CategoriesPageClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const incomeCategories = categories.filter(c => c.type === CATEGORY_TYPES.INCOME);
    const expenseCategories = categories.filter(c => c.type === CATEGORY_TYPES.EXPENSE);

    // Create action wrapper
    const createAction = async (state: CategoryActionState | undefined, formData: FormData) => {
        return await createCategory(workspaceId, state, formData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Categorias</h1>
                    <p className="text-muted">Gerencie as categorias de receitas e despesas</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <AiOutlinePlus className="mr-2" />
                    Nova Categoria
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Income Column */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-emerald-500 flex items-center gap-2">
                        Receitas
                        <span className="text-xs font-normal text-muted bg-muted/50 px-2 py-0.5 rounded-full">
                            {incomeCategories.length}
                        </span>
                    </h2>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        {incomeCategories.length === 0 ? (
                            <div className="p-8 text-center text-muted text-sm">
                                Nenhuma categoria de receita
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/50">
                                {incomeCategories.map((category) => (
                                    <CategoryItem
                                        key={category.id}
                                        category={category}
                                        workspaceId={workspaceId}
                                        currentUserId={currentUserId}
                                        isWorkspaceOwner={isWorkspaceOwner}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Expense Column */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-red-500 flex items-center gap-2">
                        Despesas
                        <span className="text-xs font-normal text-muted bg-muted/50 px-2 py-0.5 rounded-full">
                            {expenseCategories.length}
                        </span>
                    </h2>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        {expenseCategories.length === 0 ? (
                            <div className="p-8 text-center text-muted text-sm">
                                Nenhuma categoria de despesa
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/50">
                                {expenseCategories.map((category) => (
                                    <CategoryItem
                                        key={category.id}
                                        category={category}
                                        workspaceId={workspaceId}
                                        currentUserId={currentUserId}
                                        isWorkspaceOwner={isWorkspaceOwner}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>

            <CategoryFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                action={createAction}
            />
        </div>
    );
}

function CategoryItem({
    category,
    workspaceId,
    currentUserId,
    isWorkspaceOwner
}: {
    category: Category;
    workspaceId: string;
    currentUserId: string;
    isWorkspaceOwner: boolean;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [deleteState, setDeleteState] = useState<CategoryActionState | null>(null);

    const canManage = isWorkspaceOwner || category.ownerId === currentUserId;

    // Action wrappers
    const updateAction = async (state: CategoryActionState | undefined, formData: FormData) => {
        return await updateCategory(workspaceId, category.id, state, formData);
    };

    const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startDeleteTransition(async () => {
            const res = await deleteCategory(workspaceId, category.id);

            if (res.success) {
                setIsDeleteOpen(false);
            } else {
                setDeleteState(res);
            }
        });
    };

    return (
        <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || "#ccc" }}
                />
                <span className="font-medium">{category.name}</span>
            </div>
            {canManage && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <CategoryFormModal
                    isOpen={isEditOpen}
                    categoryToEdit={category}
                    onClose={() => setIsEditOpen(false)}
                    action={updateAction}
                />
            )}

            {/* Delete Modal */}
            {canManage && (
                <Modal
                    title="Excluir Categoria"
                    description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e pode afetar transações existentes."
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                >
                    <form onSubmit={handleDelete}>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isDeleting}
                                loading={isDeleting}
                            >
                                {isDeleting ? "Excluindo..." : "Excluir"}
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
        </li>
    );
}
