"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import MuiCheckbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/material/styles";

const StyledFormControlLabel = styled(FormControlLabel)({
  margin: 0,
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, hint, className = "", id, name, checked, onChange, disabled, type, ...rest }, ref) => {
    const checkboxId = id || name;

    // MUI Checkbox onChange signature: (event, checked) => void
    // HTML checkbox onChange signature: (event) => void
    // We need to adapt MUI's signature to HTML's
    const handleChange = onChange
      ? (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          // Create a synthetic event that matches HTML checkbox onChange
          const syntheticEvent = {
            ...event,
            target: {
              ...event.target,
              checked,
              value: checked ? "true" : "false",
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      : undefined;

    return (
      <div className={className}>
        <StyledFormControlLabel
          control={
            <MuiCheckbox
              inputRef={ref}
              id={checkboxId}
              name={name}
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
            />
          }
          label={label}
        />
        {(error || hint) && (
          <FormHelperText error={!!error} sx={{ marginLeft: 0, marginTop: 0.5 }}>
            {error || hint}
          </FormHelperText>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };

