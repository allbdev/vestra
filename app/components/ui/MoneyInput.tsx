"use client";

import React from "react";
import { Input, InputProps } from "@/app/components/ui/Input";

interface MoneyInputProps extends Omit<InputProps, "onChange" | "value"> {
    value: string | number; // Raw value (float or string representation of float)
    onChange: (value: string) => void; // Returns raw string value (e.g. "123.45")
}

// Format the display value
const formatDisplay = (val: string | number) => {
    if (!val) return "";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(val));
};

export function MoneyInput({ value, onChange, ...props }: MoneyInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            onChange("");
            return;
        }
        const floatValue = parseFloat(rawValue) / 100;
        onChange(floatValue.toFixed(2));
    };

    return (
        <Input
            {...props}
            type="text"
            value={formatDisplay(value)}
            onChange={handleChange}
            placeholder="R$ 0,00"
        />
    );
}
