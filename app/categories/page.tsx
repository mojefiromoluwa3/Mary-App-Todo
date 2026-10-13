import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { CategoryClient } from "@/components/categories/category-client";

export const metadata = {
  title: "Categories - FocusFlow",
  description: "Organize tasks into color-coded categories and project tags.",
};

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell>
      <CategoryClient />
    </AppShell>
  );
}
