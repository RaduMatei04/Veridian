import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

export type Status = { type: "success" | "error"; text: string } | null;

// Mesajul de după salvare: card cu text și contur verde (succes) sau roșu (eroare).
// Cel verde dispare singur după 3 secunde (vezi useStatus și animația `status-fade`).
export function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;
  const success = status.type === "success";
  const Icon = success ? CircleCheck : CircleAlert;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
        success
          ? "status-fade border-success bg-success-muted text-success" // se estompează în 3 secunde
          : "border-destructive bg-destructive/10 text-destructive"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {status.text}
    </div>
  );
}
