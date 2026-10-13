"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { TaskCard, TaskItem } from "@/components/ui/task-card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";

export function CalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks for calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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
      fetchTasks();
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
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      fetchTasks();
    }
  };

  // Month interval days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Map of tasks by date key (yyyy-MM-dd)
  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = format(new Date(t.dueDate), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [tasks]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateTasks = tasksByDate[selectedDateKey] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Calendar Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View upcoming deadlines, schedule milestones, and inspect daily commitments
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[110px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar (8 cols) + Selected Day Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const dayTasks = tasksByDate[dayKey] || [];

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                      : isCurrentMonth
                      ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      : "bg-slate-50/40 dark:bg-slate-950/40 border-transparent text-slate-300 dark:text-slate-700 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                        isTodayDate
                          ? "bg-indigo-600 text-white font-bold"
                          : isCurrentMonth
                          ? "text-slate-900 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task preview dots/chips */}
                  <div className="space-y-1 overflow-hidden mt-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 line-through"
                            : t.priority === "URGENT"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-medium pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Detail Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {isToday(selectedDate) ? "Today's Agenda" : "Scheduled For"}
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </h2>
            </div>
            <Link
              href={`/tasks/new`}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium">No tasks due on this date.</p>
              <Link
                href="/tasks/new"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule a task here</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {selectedDateTasks.map((task) => (
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
    </div>
  );
}
