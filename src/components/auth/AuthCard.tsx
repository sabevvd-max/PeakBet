import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="text-3xl">♛</span>
          <span className="font-display text-2xl font-bold text-gradient-gold">PeakBet</span>
        </Link>

        <GlassCard strong className="p-8">
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-peak-gray">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </GlassCard>

        {footer && <div className="mt-6 text-center text-sm text-peak-gray">{footer}</div>}
      </div>
    </div>
  );
}
