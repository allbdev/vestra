"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, Checkbox } from "@/app/components/ui";
import { CategorySelect } from "@/app/components/categories/CategorySelect";
import { useParams } from "next/navigation";
import { MoneyInput } from "@/app/components/ui/MoneyInput";
import { Modal } from "@/app/components/ui/Modal";
import { DatePicker } from "@/app/components/DatePicker";
import { TransactionTemplateActionState } from "@/app/actions/transaction-templates";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionTemplateSchema, TransactionTemplateFormData } from "@/app/lib/schemas";

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
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(transactionTemplateSchema),
        defaultValues: {
            description: "",
            baseAmount: undefined,
            categoryId: "",
            frequency: FREQUENCY_TYPES.MONTHLY,
            startDate: new Date().toISOString().split('T')[0],
            active: true,
        },
    });

    useEffect(() => {
        if (templateToEdit) {
            reset({
                description: templateToEdit.description,
                baseAmount: templateToEdit.baseAmount,
                categoryId: templateToEdit.categoryId || "",
                frequency: templateToEdit.frequency ?? undefined,
                startDate: new Date(templateToEdit.startDate).toISOString().split('T')[0],
                active: templateToEdit.active,
            });
        } else {
            reset({
                description: "",
                baseAmount: undefined,
                categoryId: "",
                frequency: FREQUENCY_TYPES.MONTHLY,
                startDate: new Date().toISOString().split('T')[0],
                active: true,
            });
        }
    }, [templateToEdit, isOpen, reset]);

    const onSubmit = async (data: TransactionTemplateFormData) => {
        setIsSubmitting(true);
        setServerError(null);

        const formData = new FormData();
        formData.append("description", data.description);
        formData.append("baseAmount", data.baseAmount.toString());
        formData.append("categoryId", data.categoryId);
        formData.append("frequency", data.frequency.toString());
        formData.append("startDate", data.startDate);
        if (data.active !== undefined) {
             formData.append("active", data.active ? "true" : "false");
        }

        try {
            const result = await action(undefined, formData);
            if (result?.success) {
                onClose();
            } else if (result?.errors) {
                if (result.errors._form) {
                    setServerError(result.errors._form[0]);
                }
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
            title={templateToEdit ? "Editar Recorrência" : "Nova Recorrência"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-8">
                    <Input
                        autoFocus
                        type="text"
                        label="Descrição"
                        placeholder="Ex: Salário, Aluguel..."
                        error={errors.description?.message}
                        {...register("description")}
                    />

                    <Controller
                        name="baseAmount"
                        control={control}
                        render={({ field }) => (
                            <MoneyInput
                                id="baseAmount"
                                label="Valor Base"
                                value={field.value !== undefined ? field.value.toString() : ""}
                                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                error={errors.baseAmount?.message}
                            />
                        )}
                    />

                    <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                            <CategorySelect
                                id="categoryId"
                                label="Categoria"
                                value={field.value || ""}
                                onChange={(value) => field.onChange(value)}
                                error={errors.categoryId?.message}
                                categories={categories}
                                workspaceId={workspaceId}
                            />
                        )}
                    />

                    <Controller
                        name="frequency"
                        control={control}
                        render={({ field }) => (
                            <Select
                                id="frequency"
                                label="Frequência"
                                value={field.value ? field.value.toString() : FREQUENCY_TYPES.MONTHLY.toString()}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                error={errors.frequency?.message}
                                options={Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
                                    value: value,
                                    label: label
                                }))}
                            />
                        )}
                    />

                    <Controller
                         name="startDate"
                         control={control}
                         render={({ field }) => (
                             <DatePicker
                                 value={field.value}
                                 onChange={field.onChange}
                                 label="Data de Início"
                                 error={!!errors.startDate}
                                 helperText={errors.startDate?.message}
                             />
                         )}
                    />

                    <Controller
                        name="active"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                name="active"
                                label="Ativa"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                            />
                        )}
                    />
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

