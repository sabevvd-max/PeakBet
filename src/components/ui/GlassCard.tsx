import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  glow?: boolean;
}

export function GlassCard({ className, strong, glow, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        strong ? "glass-strong" : "glass",
        glow && "glow-gold",
        className
      )}
      {...props}
    />
  );
}
