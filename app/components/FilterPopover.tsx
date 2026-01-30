"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Popover, Badge } from "@mui/material";
import { FaFilter } from "react-icons/fa";
import { DateRangePicker } from "@/app/components/DateRangePicker";
import { PeriodGroupSelector } from "@/app/components/dashboard/PeriodGroupSelector";
import { Button } from "./ui";

interface FilterPopoverProps {
    children: React.ReactNode;
    defaultValues?: Partial<FilterFormValues>;
}


interface FilterFormValues {
    startDate: string;
    endDate: string;
    periodType: number;
    [key: string]: any;
}

export function FilterPopover({ children, defaultValues = {} }: FilterPopoverProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);


    // Initialize from URL or defaults
    // We don't set hardDefaults here because the consumer might want different ones, 
    // but for receiving initial values we rely on the URL or let the components handle their internal defaults if undefined,
    // however, the Dashboard has defaults. 
    // Ideally, the current URL state *is* the state.

    const methods = useForm<FilterFormValues>({
        defaultValues: {
            startDate: searchParams.get("startDate") || defaultValues.startDate || "",
            endDate: searchParams.get("endDate") || defaultValues.endDate || "",
            periodType: searchParams.get("periodType")
                ? Number(searchParams.get("periodType"))
                : defaultValues.periodType || undefined,
        },
        mode: "onChange",
    });


    const { watch, reset, getValues } = methods;
    const watchedValues = watch();

    // Sync Form -> URL
    // We use a debounce or just effect to update URL when values change.
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let hasChanges = false;

        Object.entries(watchedValues).forEach(([key, value]) => {
            // If undefined, don't set. If null/empty string, maybe remove?
            // Let's match the logic: if value exists, set it.
            if (value !== undefined && value !== null) {
                const stringValue = String(value);
                // Only update valid dates/numbers.
                // For startDate/endDate/periodType specifically.
                if (params.get(key) !== stringValue) {
                    // Avoid setting empty strings if they weren't there, or maybe do set them?
                    // If user clears date, we want to clear URL.
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
        });

        if (hasChanges) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [watchedValues, pathname, router, searchParams]);

    // Sync URL -> Form
    // This handles back/forward navigation or parent setting defaults
    useEffect(() => {
        const newValues = {
            startDate: searchParams.get("startDate") || defaultValues.startDate || "",
            endDate: searchParams.get("endDate") || defaultValues.endDate || "",
            periodType: searchParams.get("periodType")
                ? Number(searchParams.get("periodType"))
                : (defaultValues.periodType !== undefined ? defaultValues.periodType : undefined),
        };

        const currentValues = getValues();

        // Check if we need to update form
        const needsReset =
            newValues.startDate !== currentValues.startDate ||
            newValues.endDate !== currentValues.endDate ||
            newValues.periodType !== currentValues.periodType;

        if (needsReset) {
            // preserve other values if any? currently we only have these 3.
            reset(newValues);
        }
    }, [searchParams, reset, getValues, defaultValues.startDate, defaultValues.endDate, defaultValues.periodType]);


    // Count active filters (simple heuristic: count non-empty values)
    // Or specific known keys. For now, let's count all handled keys.
    const activeFiltersCount = Object.keys(watchedValues).filter(
        (key) => watchedValues[key]
    ).length;

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
                <div className="space-y-4 min-w-[300px]">
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

// Helper for DateRange since it involves two fields
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


// Attach subcomponents
FilterPopover.Title = FilterTitle;
FilterPopover.StartDate = DateRangeController; // Directly use the controller wrapper
FilterPopover.PeriodType = FilterPeriodType;
