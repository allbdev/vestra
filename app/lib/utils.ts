// Simple class/utility merger to avoid extra dependencies for now
export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export function formatCurrency(
    value: string | number | null | undefined,
    options?: Intl.NumberFormatOptions
): string {
    if (value === null || value === undefined || value === "") {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            ...options,
        }).format(0);
    }

    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numberValue)) {
        return value.toString();
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        ...options,
    }).format(numberValue);
}
