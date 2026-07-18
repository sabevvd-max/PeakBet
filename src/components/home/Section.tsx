import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Section({
  title,
  subtitle,
  viewAllHref,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-peak-gray">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-peak-gold hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
