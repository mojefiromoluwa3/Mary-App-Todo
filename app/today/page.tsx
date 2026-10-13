import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListClient } from "@/components/tasks/task-list-client";

export const metadata = {
  title: "Today's Agenda - FocusFlow",
  description: "Tasks scheduled for completion today.",
};

export default async function TodayPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <TaskListClient
        defaultFilter="today"
        title="Today's Agenda"
        subtitle="Tasks and commitments scheduled for today"
      />
    </AppShell>
  );
}
