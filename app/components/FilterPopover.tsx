"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Popover, Badge } from "@mui/material";
import { FaFilter } from "react-icons/fa";
import { DateRangePicker } from "@/app/components/DateRangePicker";
import { PeriodGroupSelector } from "@/app/components/dashboard/PeriodGroupSelector";
import { Button, Select as UiSelect } from "./ui";
import { MultiSelect } from "./ui/MultiSelect";
import { CATEGORY_TYPES } from "../lib/consts";

interface FilterPopoverProps {
    children: React.ReactNode;
    defaultValues?: Partial<FilterFormValues>;
}


interface FilterFormValues {
    startDate: string;
    endDate: string;
    periodType: number;
    categoryIds?: string[];
    type?: string;
    [key: string]: any;
}

export function FilterPopover({ children, defaultValues = {} }: FilterPopoverProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);


    // Initialize from URL or defaults
    const methods = useForm<FilterFormValues>({
        defaultValues: {
            startDate: searchParams.get("startDate") || defaultValues.startDate || "",
            endDate: searchParams.get("endDate") || defaultValues.endDate || "",
            periodType: searchParams.get("periodType")
                ? Number(searchParams.get("periodType"))
                : defaultValues.periodType || undefined,
            categoryIds: searchParams.get("categoryIds")?.split(",") || defaultValues.categoryIds || [],
            type: searchParams.get("type") || defaultValues.type || "",
        },
        mode: "onChange",
    });


    const { watch, reset, getValues } = methods;
    const watchedValues = watch();

    // Sync Form -> URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let hasChanges = false;

        Object.entries(watchedValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // Handle arrays (like categoryIds)
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        const joined = value.join(",");
                        if (params.get(key) !== joined) {
                            params.set(key, joined);
                            hasChanges = true;
                        }
                    } else {
                        if (params.has(key)) {
                            params.delete(key);
                            hasChanges = true;
                        }
                    }
                } else {
                    const stringValue = String(value);
                    if (params.get(key) !== stringValue) {
                        if (stringValue === "" && !params.has(key)) {
                            // no-op
                        } else {
                            if (stringValue === "") {
                                params.delete(key);
                            } else {
                                params.set(key, stringValue);
                            }
                            hasChanges = true;
                        }
                    }
                }
            }
        });

        if (hasChanges) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [watchedValues, pathname, router, searchParams]);

    // Sync URL -> Form
    useEffect(() => {
        const newValues = {
            startDate: searchParams.get("startDate") || defaultValues.startDate || "",
            endDate: searchParams.get("endDate") || defaultValues.endDate || "",
            periodType: searchParams.get("periodType")
                ? Number(searchParams.get("periodType"))
                : (defaultValues.periodType !== undefined ? defaultValues.periodType : undefined),
            categoryIds: searchParams.get("categoryIds")?.split(",") || defaultValues.categoryIds || [],
            type: searchParams.get("type") || defaultValues.type || "",
        };

        const currentValues = getValues();

        const needsReset =
            newValues.startDate !== currentValues.startDate ||
            newValues.endDate !== currentValues.endDate ||
            newValues.periodType !== currentValues.periodType ||
            newValues.type !== currentValues.type ||
            (JSON.stringify(newValues.categoryIds) !== JSON.stringify(currentValues.categoryIds));

        if (needsReset) {
            reset(newValues);
        }
    }, [searchParams, reset, getValues, defaultValues.startDate, defaultValues.endDate, defaultValues.periodType]);

    let activeFiltersCount = 0;

    if (watchedValues.categoryIds && watchedValues.categoryIds.length > 0) activeFiltersCount++;
    if (watchedValues.type) activeFiltersCount++;
    if (watchedValues.startDate || watchedValues.endDate) activeFiltersCount++;
    if (watchedValues.periodType) activeFiltersCount++;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "filter-popover" : undefined;

    return (
        <FormProvider {...methods}>
            <Badge badgeContent={activeFiltersCount} color="primary">
                <Button
                    aria-describedby={id}
                    onClick={handleClick}
                    type="button"
                    variant="secondary"
                >
                    <FaFilter />
                    <span className="hidden sm:inline">Filtros</span>
                </Button>
            </Badge>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                slotProps={{
                    paper: {
                        className: "bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg max-w-sm sm:max-w-md w-full mt-2"
                    }
                }}
            >
                <div className="min-w-[300px]">
                    {children}
                </div>
            </Popover>
        </FormProvider>
    );
}

// Subcomponents

function FilterTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-semibold mb-4">{children}</h2>;
}

function DateRangeController() {
    const { setValue, watch } = useFormContext();
    const startDate = watch("startDate");
    const endDate = watch("endDate");

    return (
        <DateRangePicker
            startDate={startDate || ""}
            endDate={endDate || ""}
            onStartDateChange={(date) => setValue("startDate", date)}
            onEndDateChange={(date) => setValue("endDate", date)}
        />
    );
}


function FilterPeriodType() {
    const { control } = useFormContext();
    return (
        <Controller
            name="periodType"
            control={control}
            render={({ field }) => (
                <div className="max-w-xs">
                    <PeriodGroupSelector
                        value={field.value}
                        onChange={field.onChange}
                    />
                </div>
            )}
        />
    )
}


// Helper for Categories
function FilterCategory({ categories }: { categories: { id: string; name: string }[] }) {
    const { control } = useFormContext();
    return (
        <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
                <div className="flex flex-col gap-1">
                    <MultiSelect
                        label="Categorias"
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={field.value || []}
                        onChange={field.onChange}
                    />
                </div>
            )}
        />
    );
}

// Filter content default wrapper
function FilterContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
        </div>
    );
}

const filterOptions: Record<CATEGORY_TYPES, string> = {
    1: "Receita",
    2: "Despesa",
}

// Filter type
function FilterType() {
    const { control } = useFormContext();
    return (
        <Controller
            name="type"
            control={control}
            render={({ field }) => (
                <div className="flex flex-col gap-1">
                    <UiSelect
                        label="Tipo"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={[
                            { value: "", label: "Todos" },
                            ...Object.entries(filterOptions).map(([key, value]) => ({ value: key.toString(), label: value })),
                        ]}
                    />
                </div>
            )}
        />
    );
}



// Attach subcomponents
FilterPopover.Title = FilterTitle;
FilterPopover.StartDate = DateRangeController;
FilterPopover.PeriodType = FilterPeriodType;
FilterPopover.Category = FilterCategory;
FilterPopover.Content = FilterContent;
FilterPopover.Type = FilterType;
