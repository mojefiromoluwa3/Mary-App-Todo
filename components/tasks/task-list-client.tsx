"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { TaskCard, TaskItem } from "@/components/ui/task-card";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Inbox,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskListClientProps {
  initialTasks?: TaskItem[];
  defaultFilter?: string; // "all" | "today" | "upcoming" | "completed" | "overdue"
  title?: string;
  subtitle?: string;
}

export function TaskListClient({
  initialTasks = [],
  defaultFilter = "all",
  title = "My Tasks",
  subtitle = "Organize, track, and complete your daily goals",
}: TaskListClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(initialTasks.length === 0);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState(defaultFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("DUE_DATE");

  // Fetch categories for filtering
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch tasks based on active filter
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterTab !== "all") {
        params.append("filter", filterTab);
      }
      if (priorityFilter !== "ALL") {
        params.append("priority", priorityFilter);
      }
      if (categoryFilter !== "ALL") {
        params.append("categoryId", categoryFilter);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [filterTab, priorityFilter, categoryFilter, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle task status toggle
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on error
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  // Handle star/important toggle
  const handleImportanceChange = async (taskId: string, isImportant: boolean) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isImportant } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isImportant }),
      });
      if (!res.ok) {
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId: string) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  // Local sorting
  const sortedTasks = useMemo(() => {
    const list = [...tasks];
    return list.sort((a, b) => {
      // Always bubble starred tasks first unless completed
      if (a.isImportant && !b.isImportant && a.status !== "COMPLETED") return -1;
      if (!a.isImportant && b.isImportant && b.status !== "COMPLETED") return 1;

      if (sortBy === "DUE_DATE") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "PRIORITY") {
        const pOrder: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      } else if (sortBy === "TITLE") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "CREATED_AT") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });
  }, [tasks, sortBy]);

  // Status counts
  const totalCount = sortedTasks.length;
  const completedCount = sortedTasks.filter((t) => t.status === "COMPLETED").length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <Link
          href="/tasks/new"
          id="add-new-task-button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-sm hover:shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-sm font-medium">
        {[
          { id: "all", label: "All Tasks" },
          { id: "today", label: "Today" },
          { id: "upcoming", label: "Upcoming" },
          { id: "overdue", label: "Overdue" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filterTab === tab.id
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="md:col-span-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort tasks"
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="DUE_DATE">Sort: Due Date (Earliest)</option>
            <option value="PRIORITY">Sort: Priority (Highest)</option>
            <option value="TITLE">Sort: Alphabetical (A-Z)</option>
            <option value="CREATED_AT">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* Task Summary Badges */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span>{" "}
          tasks ({pendingCount} pending, {completedCount} completed)
        </div>
        {(priorityFilter !== "ALL" || categoryFilter !== "ALL" || search) && (
          <button
            type="button"
            onClick={() => {
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
              setSearch("");
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Task Cards List or Empty State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading your tasks...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No tasks found</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || priorityFilter !== "ALL" || categoryFilter !== "ALL"
              ? "No tasks match your current filter settings. Try clearing your filters."
              : "You have no tasks in this view. Keep up the great work or add a new goal."}
          </p>
          <div className="mt-5">
            <Link
              href="/tasks/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
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
  );
}
