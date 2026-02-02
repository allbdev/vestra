"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Checkbox } from "@/app/components/ui";
import { CategorySelect } from "@/app/components/categories/CategorySelect";
import { useParams } from "next/navigation";
import { MoneyInput } from "@/app/components/ui/MoneyInput";
import { Modal } from "@/app/components/ui/Modal";
import { DatePicker } from "@/app/components/DatePicker";
import { TransactionActionState } from "@/app/actions/transactions";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema, TransactionFormData } from "@/app/lib/schemas";

// ... existing interfaces ...
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
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(transactionSchema),
        defaultValues: {
            description: "",
            amount: undefined,
            categoryId: "",
            isPaid: false,
            date: new Date().toISOString().split('T')[0],
            paidAt: null,
        },
    });

    const isPaid = watch("isPaid");

    useEffect(() => {
        if (transactionToEdit) {
            reset({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                categoryId: transactionToEdit.categoryId || "",
                date: new Date(transactionToEdit.date).toISOString().split('T')[0],
                isPaid: transactionToEdit.isPaid,
                paidAt: transactionToEdit.paidAt ? new Date(transactionToEdit.paidAt).toISOString().split('T')[0] : null,
            });
        } else if (initialData) {
            reset({
                description: initialData.description || "",
                amount: initialData.amount,
                categoryId: initialData.categoryId || "",
                date: new Date().toISOString().split('T')[0],
                isPaid: false,
                paidAt: null,
            });
        } else {
             reset({
                description: "",
                amount: undefined, 
                categoryId: "",
                date: new Date().toISOString().split('T')[0],
                isPaid: false,
                paidAt: null,
            });
        }
    }, [transactionToEdit, initialData, isOpen, reset]);

    const handleRecurrencyChange = (recurrencyId: string) => {
        if (!recurrencyId) return;

        const recurrency = recurrencies?.find((r) => r.id === recurrencyId);
        if (recurrency) {
            setValue("description", recurrency.description);
            setValue("amount", recurrency.baseAmount);
            setValue("categoryId", recurrency.categoryId || "");
        }
    };

    const onSubmit = async (data: TransactionFormData) => {
        setIsSubmitting(true);
        setServerError(null);

        const formData = new FormData();
        formData.append("description", data.description);
        formData.append("amount", data.amount.toString());
        formData.append("categoryId", data.categoryId);
        formData.append("date", data.date);
        formData.append("isPaid", data.isPaid ? "true" : "false");
        if (data.paidAt) {
            formData.append("paidAt", data.paidAt);
        }

        try {
            const result = await action(undefined, formData);
            if (result?.success) {
                onClose();
            } else if (result?.errors) {
                // Determine if it's a form-level error or field error
                if (result.errors._form) {
                    setServerError(result.errors._form[0]);
                }
                // We could map server field errors back to RHF using setError here if we wanted precise field feedback from server
            }
        } catch (error) {
            setServerError("Ocorreu um erro ao salvar.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={transactionToEdit ? "Editar Transação" : "Nova Transação"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-8">
                    {!transactionToEdit && recurrencies && recurrencies.length > 0 && (
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <Select
                                label="Preencher com Recorrência (Opcional)"
                                name="recurrencyId"
                                id="recurrencyId"
                                onChange={(e) => handleRecurrencyChange(e.target.value as string)}
                                options={[
                                    { value: "", label: "Criar em branco" },
                                    ...recurrencies.map((r) => ({
                                        value: r.id,
                                        label: `${r.description} - R$ ${r.baseAmount}`,
                                    })),
                                ]}
                            />
                        </div>
                    )}

                    <Input
                        autoFocus
                        label="Descrição"
                        placeholder="Ex: Salário, Aluguel..."
                        required
                        error={errors.description?.message}
                        {...register("description")}
                    />

                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <MoneyInput
                                name={field.name}
                                id="amount"
                                label="Valor"
                                value={field.value !== undefined ? field.value.toString() : ""}
                                onChange={(val) => {
                                    // Handle string to number if needed, but MoneyInput typically gives raw string? 
                                    // Assuming MoneyInput expects string and returns string. 
                                    // The schema uses .transform to handle comma/dot.
                                    field.onChange(val); 
                                }}
                                required
                                error={errors.amount?.message}
                            />
                        )}
                    />

                    <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                            <CategorySelect
                                label="Categoria"
                                id="categoryId"
                                value={field.value}
                                onChange={field.onChange}
                                required
                                error={errors.categoryId?.message}
                                categories={categories}
                                workspaceId={workspaceId}
                            />
                        )}
                    />

                    <div>
                         <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    label="Data"
                                    required
                                    error={!!errors.date}
                                    helperText={errors.date?.message}
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="isPaid"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                label="Pago"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                error={errors.isPaid?.message}
                            />
                        )}
                    />

                    {isPaid && (
                        <div>
                             <Controller
                                name="paidAt"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        label="Data de Pagamento"
                                        error={!!errors.paidAt}
                                        helperText={errors.paidAt?.message}
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>

                {serverError && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
                        {serverError}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

