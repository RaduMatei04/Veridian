"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "@/frontend/components/ui/sidebar";
import { useRipple } from "@/frontend/hooks/use-ripple";
import { cn } from "@/frontend/lib/utils";

// Un buton de navigare din sidebar.
// Hover: fundal gri. Pagina activă: ring în culoarea de accent, fără fundal umplut.
// Click: efectul ripple (vezi frontend/hooks/use-ripple.tsx).
export function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const active = usePathname() === href;
  const { setOpenMobile } = useSidebar();
  const { startRipple, rippleElement } = useRipple();

  return (
    <Link
      href={href}
      onClick={(e) => {
        startRipple(e);
        setOpenMobile(false); // pe telefon, meniul se închide după ce alegi o pagină
      }}
      className={cn(
        // relative + overflow-hidden: cercul e poziționat în buton și tăiat la marginile lui
        "relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium",
        "text-sidebar-foreground transition-colors duration-150",
        "hover:bg-[var(--sidebar-hover)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none",
        // ring-inset: ring-ul e desenat în interior, ca să nu fie tăiat la marginea sidebar-ului
        active && "text-[var(--accent-color)] ring-2 ring-inset ring-[var(--accent-color)]"
      )}
    >
      {rippleElement}
      <Icon className="size-5" />
      {children}
    </Link>
  );
}
