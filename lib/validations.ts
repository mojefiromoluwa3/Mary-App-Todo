import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(40),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code (e.g. #3B82F6)"),
});

export const taskSchema = z.object({
  title: z.string().min(2, "Task title must contain at least 2 characters").max(200),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("TODO"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  dueTime: z.string().max(10).optional().nullable(),
  reminder: z.string().max(50).optional().nullable(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).default("NONE"),
  isImportant: z.boolean().default(false),
  notes: z.string().max(2000).optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export const updateTaskSchema = taskSchema.partial();

export const settingsSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  email: z.string().email().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
});
