"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Bell,
  Repeat,
  Star,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
  FolderKanban,
  FileText,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskFormClientProps {
  taskId?: string;
  initialData?: {
    title?: string;
    description?: string | null;
    priority?: string;
    status?: string;
    dueDate?: string | Date | null;
    dueTime?: string | null;
    reminder?: string | null;
    recurrence?: string | null;
    isImportant?: boolean;
    notes?: string | null;
    categoryId?: string | null;
  };
}

export function TaskFormClient({ taskId, initialData }: TaskFormClientProps) {
  const router = useRouter();
  const isEditing = Boolean(taskId);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<string>(initialData?.priority || "MEDIUM");
  const [status, setStatus] = useState<string>(initialData?.status || "TODO");
  const [dueDate, setDueDate] = useState<string>(
    initialData?.dueDate
      ? typeof initialData.dueDate === "string"
        ? initialData.dueDate.slice(0, 10)
        : format(new Date(initialData.dueDate), "yyyy-MM-dd")
      : ""
  );
  const [dueTime, setDueTime] = useState<string>(initialData?.dueTime || "");
  const [reminder, setReminder] = useState<string>(initialData?.reminder || "");
  const [recurrence, setRecurrence] = useState<string>(initialData?.recurrence || "NONE");
  const [isImportant, setIsImportant] = useState<boolean>(initialData?.isImportant || false);
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available user categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // If editing and no initialData provided, fetch task
  useEffect(() => {
    if (taskId && !initialData) {
      async function loadTask() {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/tasks/${taskId}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title || "");
            setDescription(data.description || "");
            setPriority(data.priority || "MEDIUM");
            setStatus(data.status || "TODO");
            if (data.dueDate) {
              const d = new Date(data.dueDate);
              if (!isNaN(d.getTime())) {
                setDueDate(format(d, "yyyy-MM-dd"));
              }
            }
            setDueTime(data.dueTime || "");
            setReminder(data.reminder || "");
            setRecurrence(data.recurrence || "NONE");
            setIsImportant(data.isImportant || false);
            setNotes(data.notes || "");
            setCategoryId(data.categoryId || "");
          } else {
            setError("Could not load the specified task.");
          }
        } catch {
          setError("Failed to fetch task details.");
        } finally {
          setIsLoading(false);
        }
      }
      loadTask();
    }
  }, [taskId, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 2) {
      setError("Task title must be at least 2 characters long.");
      return;
    }

    setIsLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate ? dueDate : null,
      dueTime: dueTime.trim() || null,
      reminder: reminder.trim() || null,
      recurrence,
      isImportant,
      notes: notes.trim() || null,
      categoryId: categoryId ? categoryId : null,
    };

    try {
      const url = isEditing ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save task.");
        setIsLoading(false);
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("A network error occurred while saving the task.");
      setIsLoading(false);
    }
  };

  const priorityOptions = [
    { id: "LOW", label: "Low", color: "text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" },
    { id: "MEDIUM", label: "Medium", color: "text-indigo-600 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40" },
    { id: "HIGH", label: "High", color: "text-amber-600 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40" },
    { id: "URGENT", label: "Urgent", color: "text-rose-600 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEditing ? "Modify your task details and update status" : "Add details, schedule, and organize your work"}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl text-sm bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Title Input */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
          >
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design weekly team sprint board"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Description Input */}
        <div>
          <label
            htmlFor="task-description"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, subtasks, or important background details..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
          />
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {priorityOptions.map((opt) => {
              const isSelected = priority === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                      : `${opt.color} bg-white dark:bg-slate-950/50`
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status (if editing) & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-status"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Category
            </label>
            <select
              id="task-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-due-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Due Date
            </label>
            <div className="relative">
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="task-due-time"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Due Time
            </label>
            <input
              id="task-due-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Reminder and Recurrence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-reminder"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Reminder
            </label>
            <select
              id="task-reminder"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No reminder</option>
              <option value="15 minutes before">15 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-recurrence"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Recurrence
            </label>
            <select
              id="task-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NONE">None (One-time)</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        {/* Important Star Toggle */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsImportant(!isImportant)}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                isImportant ? "fill-amber-400 text-amber-400" : "text-slate-400"
              }`}
            />
          </button>
          <div>
            <label
              htmlFor="is-important-checkbox"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
              onClick={() => setIsImportant(!isImportant)}
            >
              Mark as High Importance
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Starred tasks appear prominently on your dashboard and at the top of your list.
            </p>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label
            htmlFor="task-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
          >
            Additional Notes
          </label>
          <textarea
            id="task-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Links, checklists, resources, or meeting notes..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            id="task-submit-button"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium text-sm shadow-sm hover:shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? "Save Changes" : "Create Task"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
