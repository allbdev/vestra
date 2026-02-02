"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Input, Select } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/Modal";
import { CategoryActionState } from "@/app/actions/categories";
import { CATEGORY_TYPES } from "@/app/lib/consts";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema, CategoryFormData } from "@/app/lib/schemas";

export interface Category {
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
    onSuccess?: (category: Category) => void;
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
    onSuccess,
}: CategoryFormModalProps) {
    if (!isOpen) return null;

    return (
        <CategoryFormModalContent
            isOpen={isOpen}
            onClose={onClose}
            categoryToEdit={categoryToEdit}
            action={action}
            onSuccess={onSuccess}
        />
    );
}

function CategoryFormModalContent({
    isOpen,
    onClose,
    categoryToEdit,
    action,
    onSuccess,
}: CategoryFormModalProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(categorySchema),
        defaultValues: {
            name: "",
            type: CATEGORY_TYPES.EXPENSE,
            color: COLORS[0],
        },
    });

    const selectedColor = watch("color");

    useEffect(() => {
        if (categoryToEdit) {
            reset({
                name: categoryToEdit.name,
                type: categoryToEdit.type,
                color: categoryToEdit.color || COLORS[0],
            });
        } else {
            reset({
                name: "",
                type: CATEGORY_TYPES.EXPENSE,
                color: COLORS[0],
            });
        }
    }, [categoryToEdit, isOpen, reset]);

    const onSubmit = (data: CategoryFormData) => {
        setServerError(null);

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("type", data.type.toString());
        if (data.color) formData.append("color", data.color);

        startTransition(async () => {
            try {
                const result = await action(undefined, formData);
                if (result?.success) {
                    if (onSuccess && result.data) {
                        onSuccess(result.data);
                    }
                    onClose();
                } else if (result?.errors) {
                    if (result.errors._form) {
                        setServerError(result.errors._form[0]);
                    }
                }
            } catch (error) {
                setServerError("Ocorreu um erro ao salvar.");
                console.error(error);
            }
        });
    };

    return (
        <Modal
            title={categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
            isOpen={isOpen}
            onClose={onClose}
        >
            {/* 
              Stop propagation of clicks to prevent bubbling up to parent forms (e.g. TransactionFormModal) 
              since Modal uses Portal but React events bubble through Portals.
            */}
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                <form 
                    onSubmit={(e) => {
                        e.stopPropagation();
                        handleSubmit(onSubmit)(e);
                    }} 
                    className="space-y-6 pt-4"
                >
                <div className="flex flex-col gap-8">
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Tipo"
                                id="type"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                options={[
                                    { value: CATEGORY_TYPES.INCOME, label: "Receita" },
                                    { value: CATEGORY_TYPES.EXPENSE, label: "Despesa" },
                                ]}
                                required
                                error={errors.type?.message}
                            />
                        )}
                    />

                    <Input
                        autoFocus
                        label="Nome"
                        placeholder="Ex: Alimentação, Salário..."
                        className="w-full"
                        required
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <div>
                        <label className="text-sm font-medium mb-2 block">Cor</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setValue("color", color)}
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

                {serverError && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
                        {serverError}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending} loading={isPending}>
                        {isPending ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </form>
            </div>
        </Modal>
    );
}
