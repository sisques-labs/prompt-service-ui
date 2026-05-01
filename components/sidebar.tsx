"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Prompts", href: "/prompts" },
  { label: "Audit Logs", href: "/audit-logs" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-48 shrink-0 border-r bg-muted/30 min-h-full flex flex-col">
      <div className="px-4 py-4 border-b">
        <span className="font-semibold text-sm">Admin Panel</span>
      </div>
      <nav className="flex flex-col gap-1 p-2 pt-3">
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
