import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const metadata = {
  title: "Calendar Planning - FocusFlow",
  description: "Schedule tasks across days and months with the interactive calendar.",
};

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <CalendarClient />
    </AppShell>
  );
}
