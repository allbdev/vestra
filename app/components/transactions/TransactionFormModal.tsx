"use client";

import { useState, useEffect, useActionState } from "react";
import { Button, Input, Select, Checkbox } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/Modal";
import { TransactionActionState } from "@/app/actions/transactions";
import { CATEGORY_TYPES } from "@/app/lib/consts";

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
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionToEdit?: Transaction | null;
    categories: Category[];
    action: (state: TransactionActionState | undefined, payload: FormData) => Promise<TransactionActionState>;
}

export function TransactionFormModal({
    isOpen,
    onClose,
    transactionToEdit,
    categories,
    action,
}: TransactionFormModalProps) {
    if (!isOpen) return null;

    return (
        <TransactionFormModalContent
            isOpen={isOpen}
            onClose={onClose}
            transactionToEdit={transactionToEdit}
            categories={categories}
            action={action}
        />
    );
}

function TransactionFormModalContent({
    isOpen,
    onClose,
    transactionToEdit,
    categories,
    action,
}: TransactionFormModalProps) {
    const [state, formAction, pending] = useActionState(action, undefined);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [date, setDate] = useState<string>("");
    const [paidAt, setPaidAt] = useState<string>("");

    useEffect(() => {
        if (transactionToEdit) {
            setSelectedCategoryId(transactionToEdit.categoryId || "");
            setIsPaid(transactionToEdit.isPaid);
            // Format date for input (YYYY-MM-DD)
            const transactionDate = new Date(transactionToEdit.date);
            setDate(transactionDate.toISOString().split('T')[0]);
            // Format paidAt if exists
            if (transactionToEdit.paidAt) {
                const paidDate = new Date(transactionToEdit.paidAt);
                setPaidAt(paidDate.toISOString().split('T')[0]);
            } else {
                setPaidAt("");
            }
        } else {
            setSelectedCategoryId("");
            setIsPaid(false);
            // Default to today
            setDate(new Date().toISOString().split('T')[0]);
            setPaidAt("");
        }
    }, [transactionToEdit, isOpen]);

    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state?.success, onClose]);

    return (
        <Modal
            title={transactionToEdit ? "Editar Transação" : "Nova Transação"}
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
                    <input type="hidden" name="isPaid" value={isPaid ? "true" : "false"} />
                    <input type="hidden" name="paidAt" value={paidAt || ""} />

                    <Input
                        autoFocus
                        type="text"
                        name="description"
                        id="description"
                        label="Descrição"
                        defaultValue={transactionToEdit?.description}
                        placeholder="Ex: Salário, Aluguel..."
                        required
                        error={state?.errors?.description?.[0]}
                    />

                    <Input
                        type="number"
                        name="amount"
                        id="amount"
                        label="Valor"
                        step="0.01"
                        min="0"
                        defaultValue={transactionToEdit?.amount?.toString()}
                        placeholder="0.00"
                        required
                        error={state?.errors?.amount?.[0]}
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

                    <Input
                        type="date"
                        name="date"
                        id="date"
                        label="Data"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        error={state?.errors?.date?.[0]}
                    />

                    <Checkbox
                        name="isPaid"
                        label="Pago"
                        checked={isPaid}
                        onChange={(e) => setIsPaid(e.target.checked)}
                        error={state?.errors?.isPaid?.[0]}
                    />

                    {isPaid && (
                        <Input
                            type="date"
                            name="paidAt"
                            id="paidAt"
                            label="Data de Pagamento"
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.target.value)}
                            error={state?.errors?.paidAt?.[0]}
                        />
                    )}
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

