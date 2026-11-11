import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FadeUp } from "../animations/FadeUp";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href
        ? item.href.startsWith("http")
          ? item.href
          : `${baseUrl}${item.href}`
        : undefined,
    })),
  };

  return (
    <FadeUp delay={0.05} className="mb-6 md:mb-8">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <nav aria-label="Breadcrumb" className="flex">
        <ol className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs tracking-[0.15em] uppercase font-bold text-slate-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white truncate max-w-[150px] sm:max-w-none">
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    size={14}
                    className="ml-2 text-white/20 shrink-0"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </FadeUp>
  );
}
