"use client";

import { useState, useEffect, useActionState } from "react";
import { Button, Input } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/Modal";
import { TransactionTemplateActionState } from "@/app/actions/transaction-templates";
import { FREQUENCY_TYPES, CATEGORY_TYPES } from "@/app/lib/consts";

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
    startDate: Date;
    active: boolean;
}

interface RecurrencyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateToEdit?: TransactionTemplate | null;
    categories: Category[];
    action: (state: TransactionTemplateActionState | undefined, payload: FormData) => Promise<TransactionTemplateActionState>;
}

const FREQUENCY_LABELS = {
    [FREQUENCY_TYPES.DAILY]: "Diária",
    [FREQUENCY_TYPES.WEEKLY]: "Semanal",
    [FREQUENCY_TYPES.MONTHLY]: "Mensal",
    [FREQUENCY_TYPES.YEARLY]: "Anual",
};

export function RecurrencyFormModal({
    isOpen,
    onClose,
    templateToEdit,
    categories,
    action,
}: RecurrencyFormModalProps) {
    if (!isOpen) return null;

    return (
        <RecurrencyFormModalContent
            isOpen={isOpen}
            onClose={onClose}
            templateToEdit={templateToEdit}
            categories={categories}
            action={action}
        />
    );
}

function RecurrencyFormModalContent({
    isOpen,
    onClose,
    templateToEdit,
    categories,
    action,
}: RecurrencyFormModalProps) {
    const [state, formAction, pending] = useActionState(action, undefined);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedFrequency, setSelectedFrequency] = useState<number | null>(FREQUENCY_TYPES.MONTHLY);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>("");

    useEffect(() => {
        if (templateToEdit) {
            setSelectedCategoryId(templateToEdit.categoryId || "");
            setSelectedFrequency(templateToEdit.frequency);
            setIsActive(templateToEdit.active);
            // Format date for input (YYYY-MM-DD)
            const date = new Date(templateToEdit.startDate);
            setStartDate(date.toISOString().split('T')[0]);
        } else {
            setSelectedCategoryId("");
            setSelectedFrequency(FREQUENCY_TYPES.MONTHLY);
            setIsActive(true);
            // Default to today
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [templateToEdit, isOpen]);

    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state?.success, onClose]);

    const incomeCategories = categories.filter(c => c.type === CATEGORY_TYPES.INCOME);
    const expenseCategories = categories.filter(c => c.type === CATEGORY_TYPES.EXPENSE);

    // Determine type based on selected category
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const templateType = selectedCategory?.type || null;

    return (
        <Modal
            title={templateToEdit ? "Editar Recorrência" : "Nova Recorrência"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form
                action={formAction}
                className="space-y-6 pt-4"
            >
                <div className="space-y-4">
                    {/* Hidden Inputs for controlled states */}
                    <input type="hidden" name="categoryId" value={selectedCategoryId} />
                    <input type="hidden" name="frequency" value={selectedFrequency || ""} />
                    <input type="hidden" name="active" value={isActive ? "true" : "false"} />

                    <div>
                        <label htmlFor="description" className="text-sm font-medium mb-1.5 block">
                            Descrição
                        </label>
                        <Input
                            autoFocus
                            type="text"
                            name="description"
                            id="description"
                            defaultValue={templateToEdit?.description}
                            placeholder="Ex: Salário, Aluguel..."
                            className="w-full"
                            required
                            error={state?.errors?.description?.[0]}
                        />
                    </div>

                    <div>
                        <label htmlFor="baseAmount" className="text-sm font-medium mb-1.5 block">
                            Valor
                        </label>
                        <Input
                            type="number"
                            name="baseAmount"
                            id="baseAmount"
                            step="0.01"
                            min="0"
                            defaultValue={templateToEdit?.baseAmount?.toString()}
                            placeholder="0.00"
                            className="w-full"
                            required
                            error={state?.errors?.baseAmount?.[0]}
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="text-sm font-medium mb-1.5 block">
                            Categoria
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                        >
                            <option value="">Selecione uma categoria</option>
                            {incomeCategories.length > 0 && (
                                <optgroup label="Receitas">
                                    {incomeCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {expenseCategories.length > 0 && (
                                <optgroup label="Despesas">
                                    {expenseCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        {state?.errors?.categoryId && (
                            <p className="text-xs text-error mt-1.5">{state.errors.categoryId[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Frequência</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
                            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => {
                                const freqValue = Number(value);
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedFrequency(freqValue)}
                                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${selectedFrequency === freqValue
                                            ? "bg-card text-primary shadow-sm"
                                            : "text-muted hover:text-foreground"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        {state?.errors?.frequency && (
                            <p className="text-xs text-error mt-1.5">{state.errors.frequency[0]}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="startDate" className="text-sm font-medium mb-1.5 block">
                            Data de Início
                        </label>
                        <Input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full"
                            required
                            error={state?.errors?.startDate?.[0]}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">Ativa</span>
                        </label>
                        {state?.errors?.active && (
                            <p className="text-xs text-error mt-1.5">{state.errors.active[0]}</p>
                        )}
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

