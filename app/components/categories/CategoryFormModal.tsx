"use client";

import { useState, useEffect, useActionState } from "react";
import { Button, Input } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/Modal";
import { CategoryActionState } from "@/app/actions/categories";
import { CATEGORY_TYPES } from "@/app/lib/consts";

interface Category {
    id: string;
    name: string;
    type: number;
    color: string | null;
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit?: Category | null;
    action: (state: CategoryActionState | undefined, payload: FormData) => Promise<CategoryActionState>;
}

const COLORS = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#64748B", // Slate
];

export function CategoryFormModal({
    isOpen,
    onClose,
    categoryToEdit,
    action,
}: CategoryFormModalProps) {
    const [state, formAction, pending] = useActionState(action, undefined);

    const [selectedType, setSelectedType] = useState<number>(CATEGORY_TYPES.EXPENSE);
    const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);

    useEffect(() => {
        if (categoryToEdit) {
            setSelectedType(categoryToEdit.type);
            setSelectedColor(categoryToEdit.color || COLORS[0]);
        } else {
            setSelectedType(CATEGORY_TYPES.EXPENSE);
            setSelectedColor(COLORS[0]);
        }
    }, [categoryToEdit, isOpen]);

    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state?.success, onClose]);

    return (
        <Modal
            title={categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form
                action={formAction}
                className="space-y-6 pt-4"
            >
                <div className="space-y-4">
                    {/* Hidden Inputs for controlled states */}
                    <input type="hidden" name="type" value={selectedType} />
                    <input type="hidden" name="color" value={selectedColor} />

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setSelectedType(CATEGORY_TYPES.INCOME)}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${selectedType === CATEGORY_TYPES.INCOME
                                    ? "bg-card text-emerald-500 shadow-sm"
                                    : "text-muted hover:text-foreground"
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedType(CATEGORY_TYPES.EXPENSE)}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${selectedType === CATEGORY_TYPES.EXPENSE
                                    ? "bg-card text-red-500 shadow-sm"
                                    : "text-muted hover:text-foreground"
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="text-sm font-medium mb-1.5 block">
                            Nome
                        </label>
                        <Input
                            autoFocus
                            type="text"
                            name="name"
                            defaultValue={categoryToEdit?.name}
                            placeholder="Ex: Alimentação, Salário..."
                            className="w-full"
                            required
                            error={state?.errors?.name?.[0]}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Cor</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                                        ? "border-foreground scale-110"
                                        : "border-transparent hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {state?.errors?._form && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
                        {state.errors._form[0]}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={pending} loading={pending}>
                        {pending ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
