import Link from "next/link";

interface LogoProps {
    className?: string; // Container className
    iconClassName?: string; // Icon container overrides
    textClassName?: string; // Text overrides
    iconSize?: 8 | 9 | 10 | 16 | "custom"; // Added 16 and custom
    textSize?: "text-lg" | "text-xl" | "text-3xl" | string; // Added text-3xl and any string
    onClick?: () => void;
    layout?: "horizontal" | "vertical"; // Added layout
}

export function Logo({
    className = "",
    iconClassName = "",
    textClassName = "",
    iconSize = 10,
    textSize = "text-xl",
    onClick,
    layout = "horizontal"
}: LogoProps) {
    const sizeClasses: Record<string, string> = {
        8: "w-8 h-8",
        9: "w-9 h-9",
        10: "w-10 h-10",
        16: "w-16 h-16"
    };

    const svgSizeClasses: Record<string, string> = {
        8: "w-4 h-4",
        9: "w-5 h-5",
        10: "w-6 h-6",
        16: "w-8 h-8"
    };

    const containerClasses = layout === "vertical"
        ? `flex flex-col items-center justify-center ${className}`
        : `flex items-center gap-3 ${className}`;

    const iconContainerClasses = `${sizeClasses[iconSize] || (iconSize === "custom" ? "" : "w-10 h-10")} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform ${layout === "vertical" ? "rounded-2xl mb-4" : ""} ${iconClassName}`;

    return (
        <Link href="/" onClick={onClick} className={`group relative z-50 ${containerClasses}`}>
            <div className={iconContainerClasses}>
                <svg
                    className={`${svgSizeClasses[iconSize] || (iconSize === "custom" ? "" : "w-6 h-6")} text-white`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            {layout === "vertical" ? (
                <h1 className={`${textSize} font-bold tracking-tight text-foreground ${textClassName}`}>
                    Vestra
                </h1>
            ) : (
                <span className={`${textSize} font-bold text-foreground ${textClassName}`}>
                    Vestra
                </span>
            )}
        </Link>
    );
}
