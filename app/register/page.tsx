import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
  title: "Create Account - FocusFlow",
  description: "Create an account on FocusFlow to start organizing your life and goals.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join FocusFlow to plan, track, and accomplish your goals"
    >
      <RegisterForm />
    </AuthShell>
  );
}
