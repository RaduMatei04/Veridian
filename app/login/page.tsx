import { AuthCard } from "@/frontend/components/auth-card";
import { LoginForm } from "@/frontend/components/login-form";

// Fundal albastru fix (gradient): utilizatorul nu e logat, deci nu folosim accentul lui.
export default function LoginPage() {
  return (
    <AuthCard title="Authenticate" subtitle="Welcome! Sign in to your Veridian account to proceed.">
      <LoginForm />
    </AuthCard>
  );
}
