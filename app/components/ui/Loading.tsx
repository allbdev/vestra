import { cn } from "@/app/lib/utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-1 rounded-full z-10",
        className
      )}
    >
      <AiOutlineLoading3Quarters className="animate-spin text-primary w-5 h-5" />
    </div>
  );
}