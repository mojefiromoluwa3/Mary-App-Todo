import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "FocusFlow - Smart Productivity & Task Management",
  description:
    "Organize your life and boost your productivity with FocusFlow. A fast, modern task manager with calendar planning, priority categorization, and real-time focus analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans selection:bg-indigo-500 selection:text-white">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
