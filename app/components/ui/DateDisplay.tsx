"use client";

interface DateDisplayProps {
  date: string | Date;
  locale?: string;
  className?: string;
}

/**
 * DateDisplay component that formats dates using UTC methods to avoid timezone conversion issues.
 * This ensures that dates like "2026-01-30T00:00:00.000Z" display as 30/01/2026
 * regardless of the user's local timezone.
 */
export function DateDisplay({ date, locale = "pt-BR", className = "" }: DateDisplayProps) {
  const d = new Date(date);
  
  // Use UTC methods to avoid timezone conversion issues
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  
  // Format based on locale
  let formattedDate: string;
  if (locale === "pt-BR") {
    formattedDate = `${day}/${month}/${year}`;
  } else {
    // Fallback to standard format for other locales
    formattedDate = `${day}/${month}/${year}`;
  }
  
  return <span className={className}>{formattedDate}</span>;
}

export type { DateDisplayProps };

