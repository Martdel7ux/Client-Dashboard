"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderUp,
  GitPullRequestArrow,
  MessageSquare,
  Settings,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: FolderUp },
  { href: "/changes", label: "Change Requests", icon: GitPullRequestArrow },
  { href: "/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function ClientSidebar({
  unreadMessages = 0,
  demo = false,
}: {
  unreadMessages?: number;
  demo?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: expanded ? 232 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-surface-sunken/60 backdrop-blur"
      >
        {/* Header / collapse toggle */}
        <div className="flex h-16 items-center justify-between px-4">
          <AnimatePresence mode="wait" initial={false}>
            {expanded ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Logo />
              </motion.div>
            ) : (
              <motion.div
                key="glyph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Logo showWord={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mx-3 mb-3 flex h-9 items-center gap-3 rounded-md px-2.5 text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
        >
          <PanelLeft className="size-4 shrink-0" />
          {expanded && <span className="text-xs font-medium">Collapse</span>}
        </button>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const showBadge = item.badgeKey === "messages" && unreadMessages > 0;

            const link = (
              <Link
                href={demo ? "/preview/dashboard" : item.href}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/10 text-ink"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="client-nav-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
                  />
                )}
                <span className="relative shrink-0">
                  <Icon className="size-[18px]" />
                  {showBadge && (
                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-accent ring-2 ring-surface-sunken" />
                  )}
                </span>
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
                <TooltipContent side="right">
                  {item.label}
                  {showBadge ? ` · ${unreadMessages} new` : ""}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Sign out */}
        {demo ? (
          <div className="border-t border-line p-3">
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
          </div>
        ) : (
          <form action={signOut} className="border-t border-line p-3">
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
      </motion.aside>
    </TooltipProvider>
  );
}
