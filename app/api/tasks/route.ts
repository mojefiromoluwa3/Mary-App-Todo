import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const categoryId = searchParams.get("categoryId");
    const filter = searchParams.get("filter"); // "today", "upcoming", "completed"

    // Base where clause strictly scoped to authenticated user
    const whereClause: any = {
      userId: session.user.id,
    };

    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filter === "today") {
      whereClause.dueDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
      whereClause.status = { not: "COMPLETED" };
    } else if (filter === "upcoming") {
      whereClause.dueDate = {
        gt: endOfToday,
      };
      whereClause.status = { not: "COMPLETED" };
    } else if (filter === "completed") {
      whereClause.status = "COMPLETED";
    } else if (filter === "overdue") {
      whereClause.dueDate = {
        lt: startOfToday,
      };
      whereClause.status = { not: "COMPLETED" };
    } else if (filter === "pending") {
      whereClause.status = { not: "COMPLETED" };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: [
        { isImportant: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = taskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid task input" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Validate category ownership if categoryId is provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Selected category does not exist or does not belong to you" },
          { status: 400 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        dueTime: data.dueTime || null,
        reminder: data.reminder || null,
        recurrence: data.recurrence,
        isImportant: data.isImportant ?? false,
        notes: data.notes?.trim() || null,
        userId: session.user.id,
        categoryId: data.categoryId || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
