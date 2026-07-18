import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, icon, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-peak-gray">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-peak-gray">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-peak-border bg-peak-surface px-3.5 text-sm text-white placeholder:text-peak-gray-dim transition-colors",
            "focus:border-peak-gold/50 focus:outline-none focus:ring-1 focus:ring-peak-gold/30",
            icon && "pl-9",
            error && "border-peak-red/60 focus:border-peak-red focus:ring-peak-red/30",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-peak-red">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
