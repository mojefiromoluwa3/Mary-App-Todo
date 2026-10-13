import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const data = result.data;

    // If categoryId is being changed, verify category belongs to user if non-empty
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Selected category not found or unauthorized" },
          { status: 400 }
        );
      }
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description ? data.description.trim() : null;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.dueDate !== undefined)
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.dueTime !== undefined) updatePayload.dueTime = data.dueTime;
    if (data.reminder !== undefined) updatePayload.reminder = data.reminder;
    if (data.recurrence !== undefined) updatePayload.recurrence = data.recurrence;
    if (data.isImportant !== undefined) updatePayload.isImportant = data.isImportant;
    if (data.notes !== undefined)
      updatePayload.notes = data.notes ? data.notes.trim() : null;
    if (data.categoryId !== undefined)
      updatePayload.categoryId = data.categoryId ? data.categoryId : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
