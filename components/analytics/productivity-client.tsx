"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  TrendingUp,
  AlertCircle,
  FolderKanban,
  Zap,
} from "lucide-react";
import { TaskItem } from "@/components/ui/task-card";

interface Category {
  id: string;
  name: string;
  color: string;
}

export function ProductivityClient() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, catRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/categories"),
        ]);
        if (tasksRes.ok) {
          const t = await tasksRes.json();
          setTasks(t);
        }
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priorities
  const urgentCount = tasks.filter((t) => t.priority === "URGENT").length;
  const highCount = tasks.filter((t) => t.priority === "HIGH").length;
  const mediumCount = tasks.filter((t) => t.priority === "MEDIUM").length;
  const lowCount = tasks.filter((t) => t.priority === "LOW").length;

  // Categories counts
  const categoryStats = categories.map((cat) => {
    const count = tasks.filter((t) => t.category?.id === cat.id).length;
    const completedInCat = tasks.filter(
      (t) => t.category?.id === cat.id && t.status === "COMPLETED"
    ).length;
    return {
      ...cat,
      count,
      completedInCat,
      rate: count > 0 ? Math.round((completedInCat / count) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Productivity & Focus Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Measure task completion throughput, milestone velocity, and organizational focus
        </p>
      </div>

      {/* Top Banner Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Completion Rate Scorecard */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>Completion Score</span>
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-5xl font-black">{completionRate}%</span>
              <span className="text-sm font-medium text-indigo-100">Overall Rate</span>
            </div>
          </div>
          <p className="mt-6 text-xs text-indigo-100/90 leading-relaxed">
            {completionRate >= 75
              ? "Outstanding performance! You are closing the majority of your scheduled tasks."
              : completionRate >= 40
              ? "Steady pace! Focus on high-priority items to further boost your weekly completion."
              : "Great start! Tackle one small task at a time to build forward momentum."}
          </p>
        </div>

        {/* Focus Velocity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Focus Velocity
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {inProgress}
              </span>
              <span className="text-xs text-slate-500 font-medium">in progress now</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">To Do Queue:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{todo} tasks</span>
          </div>
        </div>

        {/* Urgent Workload */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                High Priority Items
              </span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
                {urgentCount + highCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">Urgent & High</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Completed:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {completed} of {total}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Grids: Status & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Task Status Breakdown
          </h2>

          <div className="space-y-4">
            {/* Completed */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                <span className="text-slate-500">{completed} tasks ({total > 0 ? Math.round((completed / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-indigo-600 dark:text-indigo-400">In Progress</span>
                <span className="text-slate-500">{inProgress} tasks ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* To Do */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">To Do</span>
                <span className="text-slate-500">{todo} tasks ({total > 0 ? Math.round((todo / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${total > 0 ? (todo / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Priority Distribution
          </h2>

          <div className="space-y-4">
            {/* Urgent */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-rose-500">Urgent</span>
                <span className="text-slate-500">{urgentCount} tasks</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${total > 0 ? (urgentCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* High */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-amber-500">High</span>
                <span className="text-slate-500">{highCount} tasks</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${total > 0 ? (highCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-indigo-500">Medium</span>
                <span className="text-slate-500">{mediumCount} tasks</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${total > 0 ? (mediumCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500">Low</span>
                <span className="text-slate-500">{lowCount} tasks</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${total > 0 ? (lowCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Productivity */}
      {categoryStats.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category Distribution & Progress
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Categories
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {categoryStats.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {cat.completedInCat}/{cat.count}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: cat.color,
                      width: `${cat.rate}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
