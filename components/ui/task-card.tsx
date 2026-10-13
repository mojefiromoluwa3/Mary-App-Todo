"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Star,
  Trash2,
  Edit3,
  Repeat,
  Bell,
  MoreVertical,
} from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  dueDate?: string | Date | null;
  dueTime?: string | null;
  reminder?: string | null;
  recurrence?: string | null;
  isImportant?: boolean;
  notes?: string | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  createdAt?: string | Date;
}

interface TaskCardProps {
  task: TaskItem;
  onStatusChange?: (taskId: string, newStatus: string) => Promise<void> | void;
  onImportanceChange?: (taskId: string, isImportant: boolean) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
}

export function TaskCard({
  task,
  onStatusChange,
  onImportanceChange,
  onDelete,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = task.status === "COMPLETED";

  const handleToggleComplete = async () => {
    if (isUpdating || !onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, isCompleted ? "TODO" : "COMPLETED");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStar = async () => {
    if (isUpdating || !onImportanceChange) return;
    setIsUpdating(true);
    try {
      await onImportanceChange(task.id, !task.isImportant);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating || !onDelete) return;
    if (confirm("Are you sure you want to delete this task?")) {
      setIsUpdating(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Medium
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
            Low
          </span>
        );
    }
  };

  const formatDueDate = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return null;
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;

    const overdue = !isCompleted && isPast(date) && !isToday(date);

    let label = format(date, "MMM d");
    if (isToday(date)) label = "Today";
    else if (isTomorrow(date)) label = "Tomorrow";

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          overdue
            ? "text-rose-500 font-semibold"
            : isToday(date)
            ? "text-indigo-600 dark:text-indigo-400 font-medium"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        {label}
        {overdue && " (Overdue)"}
      </span>
    );
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isCompleted
          ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75"
          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggleComplete}
          disabled={isUpdating}
          aria-label={isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 break-words ${
                isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
              }`}
            >
              {task.title}
            </h3>

            {/* Category Tag */}
            {task.category && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color,
                  border: `1px solid ${task.category.color}30`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                {task.category.name}
              </span>
            )}

            {/* Priority Tag */}
            {getPriorityBadge(task.priority)}
          </div>

          {task.description && (
            <p
              className={`mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 ${
                isCompleted ? "line-through text-slate-400 dark:text-slate-600" : ""
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Meta Info (Due Date, Time, Reminder, Recurrence) */}
          <div className="mt-2.5 flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            {formatDueDate(task.dueDate)}

            {task.dueTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.dueTime}
              </span>
            )}

            {task.reminder && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Bell className="w-3.5 h-3.5" />
                {task.reminder}
              </span>
            )}

            {task.recurrence && task.recurrence !== "NONE" && (
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Repeat className="w-3.5 h-3.5" />
                {task.recurrence.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          {/* Important Star Toggle */}
          <button
            type="button"
            onClick={handleToggleStar}
            disabled={isUpdating}
            aria-label={task.isImportant ? "Unmark important" : "Mark as important"}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                task.isImportant
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            />
          </button>

          {/* Edit Task Link */}
          <Link
            href={`/tasks/${task.id}/edit`}
            aria-label="Edit task"
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </Link>

          {/* Delete Task */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUpdating}
            aria-label="Delete task"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
