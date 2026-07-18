import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "neon";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-peak-gold-soft to-peak-gold text-peak-black font-semibold hover:brightness-110 shadow-[0_0_0_1px_rgba(255,215,0,0.3)] hover:glow-gold",
  secondary: "bg-peak-surface-2 text-white border border-peak-border hover:bg-peak-surface hover:border-peak-gold/40",
  ghost: "bg-transparent text-white hover:bg-white/5",
  outline: "bg-transparent border border-peak-gold/50 text-peak-gold hover:bg-peak-gold/10",
  danger: "bg-peak-red text-white hover:brightness-110",
  neon: "bg-peak-neon/10 border border-peak-neon text-peak-neon hover:bg-peak-neon/20 hover:glow-neon",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
