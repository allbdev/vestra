"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { LoadingSpinner } from "./Loading";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: "primary" | "secondary" | "ghost" | "unstyled" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    // Map custom variants to MUI variants
    const muiVariant: MuiButtonProps["variant"] =
      variant === "primary" || variant === "destructive"
        ? "contained"
        : variant === "secondary"
          ? "outlined"
          : "text";

    // Map custom sizes to MUI sizes
    const muiSize: MuiButtonProps["size"] =
      size === "sm" ? "small" : size === "lg" ? "large" : "medium";

    // Map color
    const muiColor: MuiButtonProps["color"] =
      variant === "destructive" ? "error" : variant === "primary" ? "primary" : "inherit";

    // Handle unstyled variant
    if (variant === "unstyled") {
      return (
        <button
          ref={ref}
          disabled={disabled || loading}
          className={className}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        size={muiSize}
        color={muiColor}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        className={className}
        startIcon={loading ? <LoadingSpinner className={variant === "primary" ? "text-white" : "text-primary"} /> : undefined}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };

