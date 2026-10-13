import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListClient } from "@/components/tasks/task-list-client";

export const metadata = {
  title: "All Tasks - FocusFlow",
  description: "Browse, filter, and organize all your tasks and projects.",
};

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <TaskListClient
        defaultFilter="all"
        title="My Tasks"
        subtitle="Organize, track, and complete your tasks"
      />
    </AppShell>
  );
}
