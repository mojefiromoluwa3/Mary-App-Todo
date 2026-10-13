"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Clock,
  CheckCircle2,
  Calendar,
  FolderKanban,
  BarChart3,
  Settings,
  User,
  Plus,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Tasks", href: "/tasks", icon: ListTodo },
  { label: "Today", href: "/today", icon: CalendarDays },
  { label: "Upcoming", href: "/upcoming", icon: Clock },
  { label: "Completed", href: "/completed", icon: CheckCircle2 },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Categories", href: "/categories", icon: FolderKanban },
  { label: "Productivity", href: "/productivity", icon: BarChart3 },
];

const secondaryNavItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const userName = session?.user?.name || "Demo User";
  const userEmail = session?.user?.email || "demo@focusflow.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>FocusFlow</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/tasks/new"
            aria-label="Create new task"
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop and Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top brand */}
        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <CheckSquare className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-300">
                FocusFlow
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="hidden md:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Create Task Button */}
          <Link
            href="/tasks/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            );
          })}

          <div className="pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Account & System
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 shadow-xs">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
