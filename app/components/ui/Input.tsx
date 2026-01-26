"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "small" | "medium";
}

const StyledTextField = styled(TextField)({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
  },
});

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = "", id, name, size = "medium", type, placeholder, value, defaultValue, disabled, readOnly, autoFocus, autoComplete, min, max, minLength, maxLength, step, pattern, onChange, onBlur, onFocus, ...rest }, ref) => {
    const inputId = id || name;

    // Convert HTML input props to MUI TextField props
    const textFieldProps: TextFieldProps = {
      id: inputId,
      name,
      label: label,
      required,
      error: !!error,
      helperText: error || hint,
      size,
      className,
      inputRef: ref,
      type,
      placeholder,
      value,
      defaultValue,
      disabled,
      inputProps: {
        readOnly,
        autoFocus,
        autoComplete,
        min,
        max,
        minLength,
        maxLength,
        step,
        pattern,
      },
      onChange,
      onBlur,
      onFocus,
    };

    return <StyledTextField {...textFieldProps} />;
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
