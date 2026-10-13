"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ListTodo,
  Check,
  Folder,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

const colorPresets = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#64748B", // Slate
];

export function CategoryClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setIsCreating(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create category");
        setIsCreating(false);
        return;
      }

      setName("");
      fetchCategories();
    } catch {
      setError("A network error occurred while creating category.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? Tasks associated with it will remain intact.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Categories & Tags
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Organize your tasks into color-coded projects and personal categories
        </p>
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

      {/* Grid: Create form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Form (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreate}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-24"
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Category
              </h2>
            </div>

            <div>
              <label
                htmlFor="cat-name-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="cat-name-input"
                type="text"
                required
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design System, Fitness, Side Project"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Color Accent
              </label>
              <div className="flex flex-wrap gap-2.5">
                {colorPresets.map((hex) => {
                  const isSelected = color.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={`Select color ${hex}`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  maxLength={7}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366F1"
                  className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">Custom hex color</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              id="create-category-btn"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Categories List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Existing Categories ({categories.length})
          </h2>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-500">
              <Folder className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">No categories yet.</p>
              <p className="text-xs text-slate-400 mt-1">Create one to group your tasks efficiently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c._count?.tasks ?? 0} task(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/tasks?categoryId=${c.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View tasks in category"
                    >
                      <ListTodo className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
