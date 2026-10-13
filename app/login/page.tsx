import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Sign In - FocusFlow",
  description: "Sign in to access your FocusFlow task dashboard and calendar.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue managing your tasks"
    >
      <LoginForm />
    </AuthShell>
  );
}
