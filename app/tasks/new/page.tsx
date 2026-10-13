import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskFormClient } from "@/components/tasks/task-form-client";

export const metadata = {
  title: "New Task - FocusFlow",
  description: "Create a new task with schedule, priority, and category.",
};

export default async function NewTaskPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <TaskFormClient />
    </AppShell>
  );
}
