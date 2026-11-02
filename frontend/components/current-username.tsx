"use client";

import { useCurrentUser } from "@/frontend/hooks/use-current-user";

// Numele utilizatorului logat, în culoarea de accent (folosit în cardul de salut).
export function CurrentUsername() {
  const { data: user } = useCurrentUser();
  return <span className="font-semibold text-primary">{user?.username ?? "..."}</span>;
}
