import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ProductivityClient } from "@/components/analytics/productivity-client";

export const metadata = {
  title: "Productivity Insights - FocusFlow",
  description: "Gain clarity on your completion rates, weekly velocity, and focus.",
};

export default async function ProductivityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <ProductivityClient />
    </AppShell>
  );
}
