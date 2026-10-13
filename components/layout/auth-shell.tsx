"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 overflow-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Decorative gradient background blooms */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-blue-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top bar controls */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm backdrop-blur-md transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-white">
              FocusFlow
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 transition-all">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          Secure, privacy-first productivity management &copy; {new Date().getFullYear()} FocusFlow
        </p>
      </div>
    </div>
  );
}
