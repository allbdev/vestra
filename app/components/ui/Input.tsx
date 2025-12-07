import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-muted mb-2"
          >
            {label} {required && <span className="text-primary">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-background border rounded-xl transition-all duration-200 placeholder:text-muted/50 focus:outline-none focus:ring-2 ${
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-border focus:border-primary focus:ring-primary/20"
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted mt-1.5">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };

