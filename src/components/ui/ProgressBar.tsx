import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0..1
  className?: string;
  barClassName?: string;
  label?: string;
}

export function ProgressBar({ value, className, barClassName, label }: ProgressBarProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-peak-surface-2 border border-peak-border">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-peak-gold-soft to-peak-gold transition-all duration-500", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && <p className="mt-1 text-xs text-peak-gray">{label}</p>}
    </div>
  );
}
