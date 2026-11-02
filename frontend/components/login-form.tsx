"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authButtonClass, authInputClass, AuthError } from "@/frontend/components/auth-card";
import { useLoginCover } from "@/frontend/components/login-cover";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const showCover = useLoginCover();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // oprim trimiterea implicită (ar pune parola în URL)
    setLoading(true);
    setError("");

    // 1. Trimitem username-ul și parola la server
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });

    // 2. Succes: serverul a pus deja cookie-ul cu JWT, deci mergem în aplicație (prin copertă)
    if (res.ok) {
      showCover();
      router.push("/home");
      return;
    }
    // 3. Eroare: afișăm mesajul primit de la server
    setError((await res.json()).error);
    setLoading(false);
  }

  return (
    <>
     <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col justify-evenly gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" autoComplete="username" required className={authInputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={authInputClass}
          />
        </div>

        <AuthError message={error} />

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Signing in..." : "Login to Veridian"}
        </button>
      </form>

      <p className="mt-6 text-center text-md text-[#667085]">
        No account?{" "}
        <Link href="/register" className="font-medium text-[#3478F6] hover:underline">
          Create account
        </Link>
      </p>
    </>
  );
}
