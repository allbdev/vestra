"use client";

import { useState, useEffect, useActionState } from "react";
import { Button, Input, Select, Checkbox } from "@/app/components/ui";
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
    startDate: string;
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

    return (
        <Modal
            title={templateToEdit ? "Editar Recorrência" : "Nova Recorrência"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form
                action={formAction}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-8">
                    {/* Hidden Inputs for controlled states */}
                    <input type="hidden" name="categoryId" value={selectedCategoryId} />
                    <input type="hidden" name="frequency" value={selectedFrequency || ""} />
                    <input type="hidden" name="active" value={isActive ? "true" : "false"} />

                    <Input
                        autoFocus
                        type="text"
                        name="description"
                        id="description"
                        label="Descrição"
                        defaultValue={templateToEdit?.description}
                        placeholder="Ex: Salário, Aluguel..."
                        required
                        error={state?.errors?.description?.[0]}
                    />

                    <Input
                        type="number"
                        name="baseAmount"
                        id="baseAmount"
                        label="Valor"
                        step="0.01"
                        min="0"
                        defaultValue={templateToEdit?.baseAmount?.toString()}
                        placeholder="0.00"
                        required
                        error={state?.errors?.baseAmount?.[0]}
                    />

                    <Select
                        label="Categoria"
                        name="categoryId"
                        required
                        id="categoryId"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value as string)}
                        options={[
                            { value: "", label: "Selecione uma categoria" },
                            ...categories.map((category) => ({
                                value: category.id,
                                label: category.type === CATEGORY_TYPES.INCOME ? `💰 ${category.name} - (Receita)` : `💸 ${category.name} - (Despesa)`,
                            }))
                        ]}
                        error={state?.errors?.categoryId?.[0]}
                    />

                    <Select
                        label="Frequência"
                        name="frequency"
                        value={selectedFrequency || ""}
                        onChange={(e) => setSelectedFrequency(e.target.value ? Number(e.target.value) : null)}
                        options={Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
                            value: Number(value),
                            label: label,
                        }))}
                        required
                        error={state?.errors?.frequency?.[0]}
                    />

                    <Input
                        type="date"
                        name="startDate"
                        id="startDate"
                        label="Data de Início"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        error={state?.errors?.startDate?.[0]}
                    />

                    <Checkbox
                        name="active"
                        label="Ativa"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        error={state?.errors?.active?.[0]}
                    />
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

