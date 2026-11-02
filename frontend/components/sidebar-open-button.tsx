"use client";

import { PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/frontend/components/ui/sidebar";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { cn } from "@/frontend/lib/utils";

// Butonul din stânga sus care deschide sidebar-ul.
// Se vede doar când sidebar-ul e închis (pe calculator) sau pe telefon.
export function SidebarOpenButton() {
  const { state, isMobile, openMobile, toggleSidebar } = useSidebar();
  const { t } = useTranslation();
  const visible = isMobile ? !openMobile : state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={t.sidebar.open}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed top-3 left-3 z-20 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md",
        "transition-opacity duration-300 hover:opacity-90",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        // Apare după ce sidebar-ul aproape s-a închis; dispare imediat la deschidere
        visible ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
      )}
    >
      <PanelLeftOpen className="size-5" />
    </button>
  );
}
