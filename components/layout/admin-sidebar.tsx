"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { signOut } from "@/app/(auth)/login/actions";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
];

/**
 * Admin sidebar. In `demo` mode every link points at the preview route and the
 * sign-out becomes a plain link, so it works without a Supabase session.
 */
export function AdminSidebar({ demo = false }: { demo?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: expanded ? 232 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-surface-sunken/60 backdrop-blur"
      >
        <div className="flex h-16 items-center px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={expanded ? "full" : "glyph"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo showWord={expanded} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mx-3 mb-2 flex items-center gap-2 px-2.5">
          <span className="rounded border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            Admin
          </span>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mx-3 mb-3 flex h-9 items-center gap-3 rounded-md px-2.5 text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
        >
          <PanelLeft className="size-4 shrink-0" />
          {expanded && <span className="text-xs font-medium">Collapse</span>}
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const href = demo ? "/preview/admin" : item.href;

            const link = (
              <Link
                href={href}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/10 text-ink"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
                  />
                )}
                <Icon className="size-[18px] shrink-0" />
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );

            return expanded ? (
              <div key={item.href}>{link}</div>
            ) : (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          {demo ? (
            <Link
              href="/login"
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink",
                !expanded && "w-10 justify-center px-0",
              )}
            >
              <LogOut className="size-[18px] shrink-0" />
              {expanded && "Exit preview"}
            </Link>
          ) : (
            <form action={signOut}>
              {expanded ? (
                <button className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink">
                  <LogOut className="size-[18px] shrink-0" />
                  Sign out
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex size-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink">
                      <LogOut className="size-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign out</TooltipContent>
                </Tooltip>
              )}
            </form>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
