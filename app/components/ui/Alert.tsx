import { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  variant?: "error" | "success" | "warning" | "info";
  className?: string;
}

export function Alert({ children, variant = "error", className = "" }: AlertProps) {
  const variants = {
    error: "bg-error/10 border-error/20 text-error",
    success: "bg-success/10 border-success/20 text-success",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    info: "bg-accent/10 border-accent/20 text-accent",
  };

  return (
    <div
      className={`p-3 border rounded-xl text-sm animate-fade-in ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

