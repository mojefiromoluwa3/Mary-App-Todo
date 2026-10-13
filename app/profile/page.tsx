import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  Settings,
} from "lucide-react";

export const metadata = {
  title: "Profile - FocusFlow",
  description: "View your user account information and task activity overview.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          tasks: true,
          categories: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const completedCount = await prisma.task.count({
    where: { userId: user.id, status: "COMPLETED" },
  });

  const memberSince = user.createdAt
    ? format(new Date(user.createdAt), "MMMM d, yyyy")
    : "Recently joined";

  const userInitials = (user.name || "Alex Morgan")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Account summary, identity details, and activity records
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/25 flex-shrink-0">
            {userInitials}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {user.name || "Anonymous User"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {memberSince}</span>
            </p>

            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tasks Created
            </span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              {user._count.tasks}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Tasks
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
              {completedCount}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-3">
              {user._count.categories}
            </p>
          </div>
        </div>

        {/* Security & Isolation Notice */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              Strict User-Isolation Enabled
            </p>
            <p className="mt-0.5">
              Your tasks, categories, and settings are strictly partitioned and encrypted with session-based tokens. No foreign user can access or mutate your personal schedule.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
