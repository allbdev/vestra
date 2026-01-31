"use client";

import { useState, useEffect, useActionState } from "react";
import { Button, Input, Select, Checkbox } from "@/app/components/ui";
import { MoneyInput } from "@/app/components/ui/MoneyInput";
import { Modal } from "@/app/components/ui/Modal";
import { DatePicker } from "@/app/components/DatePicker";
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

interface TransactionTemplate {
    id: string;
    description: string;
    baseAmount: number;
    categoryId: string | null;
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionToEdit?: Transaction | null;
    initialData?: Partial<Transaction> | null;
    categories: Category[];
    recurrencies?: TransactionTemplate[];
    action: (state: TransactionActionState | undefined, payload: FormData) => Promise<TransactionActionState>;
}

export function TransactionFormModal({
    isOpen,
    onClose,
    transactionToEdit,
    initialData,
    categories,
    recurrencies,
    action,
}: TransactionFormModalProps) {
    if (!isOpen) return null;

    return (
        <TransactionFormModalContent
            isOpen={isOpen}
            onClose={onClose}
            transactionToEdit={transactionToEdit}
            initialData={initialData}
            categories={categories}
            recurrencies={recurrencies}
            action={action}
        />
    );
}

function TransactionFormModalContent({
    isOpen,
    onClose,
    transactionToEdit,
    initialData,
    categories,
    recurrencies,
    action,
}: TransactionFormModalProps) {
    const [state, formAction, pending] = useActionState(action, undefined);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedRecurrencyId, setSelectedRecurrencyId] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [date, setDate] = useState<string>("");
    const [paidAt, setPaidAt] = useState<string>("");

    useEffect(() => {
        if (transactionToEdit) {
            setSelectedCategoryId(transactionToEdit.categoryId || "");
            setDescription(transactionToEdit.description);
            setAmount(transactionToEdit.amount.toString());
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
        } else if (initialData) {
            // Cloning logic
            setSelectedCategoryId(initialData.categoryId || "");
            setDescription(initialData.description || "");
            setAmount(initialData.amount ? initialData.amount.toString() : "");
            setIsPaid(false); // Clone usually starts unpaid? Or copy state? Request said "pre-filled", implies copy. But let's defaulting to current day for new transaction usually, but maybe keep original date?
            // "pre-filled" usually means copy everything as is, but maybe date should be today?
            // Let's assume date is today (new transaction) but other data is copied.
            setDate(new Date().toISOString().split('T')[0]);
            setPaidAt(""); // Reset payment date
            // If user wants to clone exactly, they can edit date.
        } else {
            // Reset form when opening for creation (and no recurrency selected yet)
            setSelectedCategoryId("");
            setDescription("");
            setAmount("");
            setIsPaid(false);
            // Default to today
            setDate(new Date().toISOString().split('T')[0]);
            setPaidAt("");
            // Reset recurrency selection if opening fresh
            if (isOpen) setSelectedRecurrencyId("");
        }
    }, [transactionToEdit, initialData, isOpen]);

    // Handle recurrency selection
    const handleRecurrencyChange = (recurrencyId: string) => {
        setSelectedRecurrencyId(recurrencyId);
        if (!recurrencyId) return;

        const recurrency = recurrencies?.find(r => r.id === recurrencyId);
        if (recurrency) {
            // Update form fields
            setDescription(recurrency.description);
            setAmount(recurrency.baseAmount.toString());
            setSelectedCategoryId(recurrency.categoryId || "");
        }
    };

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
                    {/* Recurrency Selector - Only show for new transactions */}
                    {!transactionToEdit && recurrencies && recurrencies.length > 0 && (
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <Select
                                label="Preencher com Recorrência (Opcional)"
                                name="recurrencyId"
                                id="recurrencyId"
                                value={selectedRecurrencyId}
                                onChange={(e) => handleRecurrencyChange(e.target.value as string)}
                                options={[
                                    { value: "", label: "Criar em branco" },
                                    ...recurrencies.map((r) => ({
                                        value: r.id,
                                        label: `${r.description} - R$ ${r.baseAmount}`
                                    }))
                                ]}
                            />
                        </div>
                    )}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Salário, Aluguel..."
                        required
                        error={state?.errors?.description?.[0]}
                    />

                    {/* Hidden input for raw amount sending to server */}
                    <input type="hidden" name="amount" value={amount} />

                    <MoneyInput
                        name="amount_display"
                        id="amount"
                        label="Valor"
                        value={amount}
                        onChange={setAmount}
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

                    <div>
                        <DatePicker
                            value={date}
                            onChange={setDate}
                            label="Data"
                            required
                            error={!!state?.errors?.date?.[0]}
                            helperText={state?.errors?.date?.[0]}
                        />
                        <input type="hidden" name="date" value={date} />
                    </div>

                    <Checkbox
                        name="isPaid"
                        label="Pago"
                        checked={isPaid}
                        onChange={(e) => setIsPaid(e.target.checked)}
                        error={state?.errors?.isPaid?.[0]}
                    />

                    {isPaid && (
                        <div>
                            <DatePicker
                                value={paidAt}
                                onChange={setPaidAt}
                                label="Data de Pagamento"
                                error={!!state?.errors?.paidAt?.[0]}
                                helperText={state?.errors?.paidAt?.[0]}
                            />
                            <input type="hidden" name="paidAt" value={paidAt || ""} />
                        </div>
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

