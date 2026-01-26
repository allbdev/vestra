"use client";

import { forwardRef, ReactNode } from "react";
import MuiSelect, { SelectProps as MuiSelectProps } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/material/styles";

const StyledFormControl = styled(FormControl)({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
  },
});

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  children?: ReactNode;
  size?: "small" | "medium";
  multiple?: boolean;
  id?: string;
  name?: string;
  value?: string | number | (string | number)[];
  onChange?: MuiSelectProps<string | number>["onChange"];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      required,
      className = "",
      id,
      name,
      value,
      onChange,
      options = [],
      children,
      size = "medium",
      multiple = false,
      disabled,
    },
    ref
  ) => {
    const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
    const labelId = `${selectId}-label`;
    const labelText = label ? (required ? `${label} *` : label) : undefined;

    // Convert to MUI Select props
    const selectProps: MuiSelectProps = {
      id: selectId,
      name,
      required,
      error: !!error,
      value: value ?? (multiple ? [] : ""),
      onChange: onChange as any,
      size,
      multiple,
      disabled,
      className,
      inputRef: ref,
      labelId: label ? labelId : undefined,
      label: labelText,
    };

    return (
      <StyledFormControl error={!!error} required={required} size={size} fullWidth className={className}>
        {label && (
          <InputLabel id={labelId}>
            {label}
          </InputLabel>
        )}
        <MuiSelect {...selectProps}>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {children}
        </MuiSelect>
        {(error || hint) && (
          <FormHelperText error={!!error}>{error || hint}</FormHelperText>
        )}
      </StyledFormControl>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };

