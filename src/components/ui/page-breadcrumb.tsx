"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageBreadcrumbProps {
  crumbs: BreadcrumbCrumb[];
  className?: string;
  includeJsonLd?: boolean;
}

/**
 * PageBreadcrumb — an accessible, semantic, SEO-ready nav trail rendered below the sticky header.
 * Conforms to W3C WAI-ARIA breadcrumb pattern using <nav>, <ol>, <li>, and aria-current="page".
 * Supports both Next.js <Link> (for real navigation, right-click, and crawler indexing)
 * and <button> callbacks (for wizard steps).
 * Mobile: collapses middle crumbs, showing 🏠 › Current Page.
 * Desktop (sm+): displays full structured trail.
 */
export function PageBreadcrumb({ crumbs, className, includeJsonLd = true }: PageBreadcrumbProps) {
  if (crumbs.length === 0) return null;

  const current = crumbs[crumbs.length - 1];
  const parents = crumbs.slice(0, -1);

  // Generate Schema.org BreadcrumbList
  const jsonLdItems = crumbs.map((crumb, idx) => {
    let url = crumb.href;
    if (!url && idx === 0 && crumb.label.toLowerCase() === "home") {
      url = "/";
    }
    const fullUrl = url
      ? (url.startsWith("http")
          ? url
          : `https://www.smartinvites.com.pk${url.startsWith("/") ? url : `/${url}`}`)
      : undefined;

    const item: Record<string, any> = {
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.label,
    };
    if (fullUrl) {
      item.item = fullUrl;
    }
    return item;
  });

  const jsonLd =
    includeJsonLd && jsonLdItems.length > 1
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: jsonLdItems,
        }
      : null;

  const renderCrumbContent = (crumb: BreadcrumbCrumb, isFirstHome = false) => {
    const content = (
      <>
        {isFirstHome && <Home className="w-3 h-3 shrink-0" aria-hidden="true" />}
        <span className={isFirstHome ? "hidden sm:inline" : ""}>{crumb.label}</span>
      </>
    );

    const baseClass =
      "shrink-0 flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors duration-150 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm";

    if (crumb.href) {
      return (
        <Link href={crumb.href} className={baseClass} aria-label={isFirstHome ? "Go to Home" : crumb.label}>
          {content}
        </Link>
      );
    }

    if (crumb.onClick) {
      return (
        <button
          type="button"
          onClick={crumb.onClick}
          className={baseClass}
          aria-label={isFirstHome ? "Go to Home" : crumb.label}
        >
          {content}
        </button>
      );
    }

    return <span className="text-muted-foreground font-medium">{crumb.label}</span>;
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={cn(
          "w-full bg-background/50 border-b border-border/20 px-4 sm:px-6 lg:px-8",
          className
        )}
      >
        <ol className="mx-auto max-w-7xl h-8 flex items-center gap-1 text-[11px] overflow-x-auto scrollbar-none whitespace-nowrap list-none p-0 m-0">
          {/* First parent (Home) — always visible */}
          {parents[0] && (
            <li className="inline-flex items-center gap-1 shrink-0">
              {renderCrumbContent(parents[0], parents[0].label.toLowerCase() === "home")}
            </li>
          )}

          {/* Middle crumbs — hidden on mobile, shown on sm+ */}
          {parents.slice(1).map((crumb, i) => (
            <li key={i} className="hidden sm:inline-flex items-center gap-1 shrink-0">
              <span aria-hidden="true">
                <ChevronRight className="w-3 h-3 text-border shrink-0" />
              </span>
              {renderCrumbContent(crumb)}
            </li>
          ))}

          {/* Separator before current */}
          {parents.length > 0 && (
            <li aria-hidden="true" className="inline-flex items-center shrink-0">
              <ChevronRight className="w-3 h-3 text-border shrink-0" />
            </li>
          )}

          {/* Current page — always visible, semantic aria-current="page" */}
          <li
            aria-current="page"
            className="text-foreground/80 font-semibold shrink-0 tracking-wide inline-flex items-center"
          >
            {current.label}
          </li>
        </ol>
      </nav>
    </>
  );
}
