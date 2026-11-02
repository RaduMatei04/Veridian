"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authButtonClass, authInputClass, AuthError } from "@/frontend/components/auth-card";
import { useLoginCover } from "@/frontend/components/login-cover";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const showCover = useLoginCover();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const password = form.get("password");

    // Confirmarea parolei se verifică direct în browser; serverul nu are nevoie de ea
    if (password !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password }),
    });

    // Contul e creat și utilizatorul e deja logat (cookie setat de server)
    if (res.ok) {
      showCover();
      router.push("/home");
      return;
    }
    setError((await res.json()).error);
    setLoading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            className={authInputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            className={authInputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className={authInputClass}
          />
        </div>

        <AuthError message={error} />

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-15 text-center text-md text-[#667085]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#3478F6] hover:underline">
          Login
        </Link>
      </p>
    </>
  );
}
