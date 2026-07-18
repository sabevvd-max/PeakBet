import { cn } from "@/lib/utils";

interface AvatarProps {
  username?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({ username, avatarUrl, size = "md", className }: AvatarProps) {
  const initials = (username || "?").slice(0, 2).toUpperCase();

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={username ?? "avatar"}
        className={cn("rounded-full object-cover border border-peak-border", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-peak-gold/40 bg-gradient-to-br from-peak-gold/20 to-peak-black font-bold text-peak-gold",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
