"use client";

import { useState } from "react";
import { Select, Button } from "@/app/components/ui";
import { CategoryFormModal, Category } from "./CategoryFormModal";
import { AiOutlinePlus } from "react-icons/ai";
import { createCategory } from "@/app/actions/categories";
import { CATEGORY_TYPES } from "@/app/lib/consts";

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    categories: Category[];
    workspaceId: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
}

export function CategorySelect({
    value,
    onChange,
    categories: initialCategories,
    workspaceId,
    label = "Categoria",
    error,
    required,
    disabled,
    id,
}: CategorySelectProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateSuccess = (newCategory: Category) => {
        setCategories((prev) => [newCategory, ...prev]);
        onChange(newCategory.id);
    };
    
    const options = [
        { value: "", label: "Selecione uma categoria" },
        ...categories.map((category) => ({
            value: category.id,
            label: category.type === CATEGORY_TYPES.INCOME
                ? `💰 ${category.name} - (Receita)`
                : `💸 ${category.name} - (Despesa)`,
        })),
    ];

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <Select
                    id={id}
                    label={label}
                    value={value}
                    onChange={(e) => onChange(String(e.target.value))}
                    options={options}
                    error={error}
                    required={required}
                    disabled={disabled}
                />
            </div>
            <div className="mb-[2px]">
                <Button
                    type="button"
                    variant="secondary"
                    className="h-[42px] px-3"
                    onClick={() => setIsModalOpen(true)}
                    title="Nova Categoria"
                >
                    <AiOutlinePlus className="w-5 h-5" />
                </Button>
            </div>

            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                action={createCategory.bind(null, workspaceId)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
