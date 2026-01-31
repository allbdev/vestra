"use client";

import { formatCurrency } from "@/app/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function KPICard({ title, value, subtitle, className = "" }: KPICardProps) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 sm:p-6 ${className}`}>
      <h3 className="text-sm font-medium text-muted mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
        {formatCurrency(value)}
      </p>
      {subtitle && (
        <p className="text-xs text-muted">{subtitle}</p>
      )}
    </div>
  );
}


