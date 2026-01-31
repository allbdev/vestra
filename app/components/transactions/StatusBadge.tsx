import { cn } from "@/app/lib/utils";

interface StatusBadgeProps {
    isPaid: boolean;
    date: string | Date; // Transaction date (due date)
    className?: string;
    showLabel?: boolean;
}

export function StatusBadge({ isPaid, date, className, showLabel = true }: StatusBadgeProps) {
    const dueDate = new Date(date);
    const today = new Date();
    // Normalize dates to ignore time for overdue calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const isOverdue = !isPaid && dueDate < today;

    let bgClass = "";
    let textClass = "";
    let label = "";

    if (isPaid) {
        bgClass = "bg-emerald-500/10";
        textClass = "text-emerald-600 dark:text-emerald-500";
        label = "Pago";
    } else if (isOverdue) {
        bgClass = "bg-red-500/10";
        textClass = "text-red-600 dark:text-red-500";
        label = "Atrasado";
    } else {
        bgClass = "bg-yellow-500/10";
        textClass = "text-yellow-600 dark:text-yellow-500";
        label = "Pendente";
    }

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent",
                bgClass,
                textClass,
                className
            )}
        >
            {showLabel ? label : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        </span>
    );
}
