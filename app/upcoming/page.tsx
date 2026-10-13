import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListClient } from "@/components/tasks/task-list-client";

export const metadata = {
  title: "Upcoming Deadlines - FocusFlow",
  description: "Tasks and milestones due in the upcoming days and weeks.",
};

export default async function UpcomingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <TaskListClient
        defaultFilter="upcoming"
        title="Upcoming Deadlines"
        subtitle="Future milestones, meetings, and deadlines"
      />
    </AppShell>
  );
}
