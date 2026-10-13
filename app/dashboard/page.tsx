import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = {
  title: "Dashboard - FocusFlow",
  description: "Your personalized productivity overview and active agenda.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
