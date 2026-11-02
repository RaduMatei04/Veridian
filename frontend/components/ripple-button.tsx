"use client";

import type { ComponentProps } from "react";
import { useRipple } from "@/frontend/hooks/use-ripple";
import { cn } from "@/frontend/lib/utils";

// Un <button> obișnuit, plus efectul ripple la click.
export function RippleButton({ className, children, onClick, ...props }: ComponentProps<"button">) {
  const { startRipple, rippleElement } = useRipple();

  return (
    <button
      // relative + overflow-hidden: cercul e poziționat în buton și tăiat la marginile lui
      className={cn("relative overflow-hidden", className)}
      onClick={(e) => {
        startRipple(e);
        onClick?.(e);
      }}
      {...props}
    >
      {rippleElement}
      {children}
    </button>
  );
}
