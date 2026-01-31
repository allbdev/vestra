"use client";

import { forwardRef } from "react";
import MuiSelect, { SelectProps as MuiSelectProps } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const StyledFormControl = styled(FormControl)({
    width: "100%",
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
    }
});

// We need to mimic the InputLabel behavior of the standard Select to ensure it looks the same.
// The standard Select uses valid MuiInputLabel-shrink class when value is present.

export interface MultiSelectOption {
    value: string | number;
    label: string;
}

interface MultiSelectProps extends Omit<MuiSelectProps, "value" | "onChange" | "renderValue"> {
    label?: string;
    error?: boolean;
    hint?: string;
    options: MultiSelectOption[];
    value?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
    required?: boolean;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
    (
        {
            label,
            error,
            hint,
            required,
            className = "",
            id,
            name,
            value = [],
            onChange,
            options = [],
            size = "medium",
            disabled,
            ...props
        },
        ref
    ) => {
        const selectId = id || name || `multiselect-${Math.random().toString(36).substr(2, 9)}`;
        const labelId = `${selectId}-label`;
        const labelText = label ? (required ? `${label} *` : label) : undefined;

        const ITEM_HEIGHT = 48;
        const ITEM_PADDING_TOP = 8;
        const MenuProps = {
            PaperProps: {
                style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250,
                },
            },
        };

        const handleChange = (event: any) => {
            const { target: { value } } = event;
            // logic for autofill support if needed, but usually strictly controlled
            onChange?.(typeof value === 'string' ? value.split(',') : value);
        };

        return (
            <StyledFormControl error={!!error} required={required} size={size} fullWidth className={className}>
                {label && (
                    <InputLabel id={labelId}>
                        {label}
                    </InputLabel>
                )}
                <MuiSelect
                    labelId={labelId}
                    id={selectId}
                    multiple
                    value={value}
                    onChange={handleChange}
                    inputRef={ref}
                    label={labelText} // Passing label to Select helps with the outline gap
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as (string | number)[]).map((val) => {
                                const option = options.find(o => o.value === val);
                                return <Chip key={val} label={option ? option.label : val} size="small" />;
                            })}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                    {...props}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </MuiSelect>
                {(error || hint) && (
                    <FormHelperText error={!!error}>{error || hint}</FormHelperText>
                )}
            </StyledFormControl>
        );
    }
);

MultiSelect.displayName = "MultiSelect";
