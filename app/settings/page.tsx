import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = {
  title: "Settings - FocusFlow",
  description: "Manage your theme, notification preferences, and account profile.",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}
