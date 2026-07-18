import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "neon" | "red" | "blue" | "purple" | "gray";

const variantClasses: Record<Variant, string> = {
  gold: "bg-peak-gold/15 text-peak-gold border-peak-gold/30",
  neon: "bg-peak-neon/15 text-peak-neon border-peak-neon/30",
  red: "bg-peak-red/15 text-peak-red border-peak-red/30",
  blue: "bg-peak-blue/15 text-peak-blue border-peak-blue/30",
  purple: "bg-peak-purple/15 text-peak-purple border-peak-purple/30",
  gray: "bg-white/5 text-peak-gray border-peak-border",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "gold", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
