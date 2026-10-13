import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListClient } from "@/components/tasks/task-list-client";

export const metadata = {
  title: "Completed Archive - FocusFlow",
  description: "Browse all your successfully completed goals and tasks.",
};

export default async function CompletedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <TaskListClient
        defaultFilter="completed"
        title="Completed Archive"
        subtitle="Review and celebrate your completed tasks and victories"
      />
    </AppShell>
  );
}
