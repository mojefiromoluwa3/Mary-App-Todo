import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaskFormClient } from "@/components/tasks/task-form-client";

export const metadata = {
  title: "Edit Task - FocusFlow",
  description: "Update task parameters, dates, and details.",
};

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <AppShell>
      <TaskFormClient taskId={id} />
    </AppShell>
  );
}
