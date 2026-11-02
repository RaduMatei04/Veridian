import { AuthCard } from "@/frontend/components/auth-card";
import { RegisterForm } from "@/frontend/components/register-form";

// Același aspect ca /login: fundal albastru fix, card alb.
export default function RegisterPage() {
  return (
    <AuthCard title="Create account" subtitle="Create your Veridian account.">
      <RegisterForm />
    </AuthCard>
  );
}
