"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { TaskCard, TaskItem } from "@/components/ui/task-card";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  Flame,
  ListTodo,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

export function DashboardClient() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick add states
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<string>("MEDIUM");
  const [quickDue, setQuickDue] = useState<string>("today"); // "today" | "tomorrow" | "none"
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, categoriesRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/categories"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchData();
    }
  };

  const handleImportanceChange = async (taskId: string, isImportant: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isImportant } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isImportant }),
      });
    } catch {
      fetchData();
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      fetchData();
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isQuickAdding) return;

    setIsQuickAdding(true);

    let dueDate: string | null = null;
    const now = new Date();
    if (quickDue === "today") {
      dueDate = format(now, "yyyy-MM-dd");
    } else if (quickDue === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = format(tomorrow, "yyyy-MM-dd");
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle.trim(),
          priority: quickPriority,
          status: "TODO",
          dueDate,
        }),
      });

      if (res.ok) {
        setQuickTitle("");
        fetchData();
      }
    } catch (err) {
      console.error("Quick add failed:", err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Metrics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return isToday(d);
  });

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "COMPLETED") return false;
    const d = new Date(t.dueDate);
    return isPast(d) && !isToday(d);
  });

  const importantPendingTasks = tasks.filter(
    (t) => (t.isImportant || t.priority === "URGENT") && t.status !== "COMPLETED"
  );

  const upcomingTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "COMPLETED") return false;
    const d = new Date(t.dueDate);
    return !isToday(d) && !isPast(d);
  });

  const userName = session?.user?.name || "there";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="absolute right-[-30px] top-[-30px] w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Productivity Flow</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-indigo-100/90 text-sm sm:text-base leading-relaxed">
            You have <span className="font-bold text-white">{pendingTasks}</span> active tasks.{" "}
            {overdueTasks.length > 0 ? (
              <span className="text-amber-300 font-medium">
                {overdueTasks.length} task(s) require attention today.
              </span>
            ) : (
              <span>You are on top of your schedule!</span>
            )}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Tasks
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {pendingTasks}
            </span>
            <span className="ml-2 text-xs text-slate-500">of {totalTasks} total</span>
          </div>
        </div>

        {/* Due Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due Today
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {todayTasks.length}
            </span>
            <span className="ml-2 text-xs text-slate-500">tasks scheduled</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overdue
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overdueTasks.length}
            </span>
            <span className="ml-2 text-xs text-slate-500">needs action</span>
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {completedTasks}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {completionRate}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="What needs to get done next? (e.g. Schedule meeting with design team)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Priority quick select */}
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              aria-label="Task priority"
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Due date quick toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50/50 dark:bg-slate-950 text-xs">
              <button
                type="button"
                onClick={() => setQuickDue("today")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  quickDue === "today"
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDue("tomorrow")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  quickDue === "tomorrow"
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tmrw
              </button>
              <button
                type="button"
                onClick={() => setQuickDue("none")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  quickDue === "none"
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Later
              </button>
            </div>

            <button
              type="submit"
              disabled={!quickTitle.trim() || isQuickAdding}
              id="dashboard-quick-add-btn"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Two Column Layout: Today / Starred vs Upcoming / Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Today & Starred */}
        <div className="lg:col-span-7 space-y-6">
          {/* High Priority & Starred Spotlight */}
          {importantPendingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Important & Urgent Focus
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {importantPendingTasks.length} tasks
                </span>
              </div>
              <div className="space-y-2.5">
                {importantPendingTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onImportanceChange={handleImportanceChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Today&apos;s Agenda
                </h2>
              </div>
              <Link
                href="/today"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No tasks scheduled for today.
                </p>
                <Link
                  href="/tasks/new"
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-block"
                >
                  + Schedule a task for today
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onImportanceChange={handleImportanceChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Upcoming & Categories */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Schedule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Deadlines
                </h2>
              </div>
              <Link
                href="/upcoming"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No upcoming deadlines in the next few days.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d") : ""}
                        {task.dueTime ? ` at ${task.dueTime}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories Quick List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Folders
              </h2>
              <Link
                href="/categories"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/tasks?categoryId=${c.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${c.color}15`,
                    color: c.color,
                    borderColor: `${c.color}35`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
