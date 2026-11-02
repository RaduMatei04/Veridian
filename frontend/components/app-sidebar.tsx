"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChartLine,
  ChevronsUpDown,
  House,
  LogOut,
  Map as MapIcon,
  PanelLeftClose,
  RadioTower,
  Settings,
  User,
} from "lucide-react";
import { Logo } from "@/frontend/components/logo";
import { SidebarLink } from "@/frontend/components/sidebar-link";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/frontend/components/ui/sidebar";
import { useCurrentUser } from "@/frontend/hooks/use-current-user";
import { useTranslation } from "@/frontend/hooks/use-translation";

// `key` = numele textului din dicționar (t.sidebar.home, t.sidebar.map, ...)
const PAGES = [
  { href: "/home", key: "home", icon: House },
  { href: "/map", key: "map", icon: MapIcon },
  { href: "/analytics", key: "analytics", icon: ChartLine },
  { href: "/stations", key: "stations", icon: RadioTower },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

// Conținutul apare cu fade + o mică alunecare după ce sidebar-ul începe să se lărgească,
// și dispare la fel când se restrânge. `group` e elementul Sidebar (are data-state).
const buildIn =
  "transition-[opacity,translate] duration-300 ease-out " +
  "group-data-[state=expanded]:delay-100 " +
  "group-data-[state=collapsed]:-translate-x-4 group-data-[state=collapsed]:opacity-0";

export function AppSidebar() {
  const { toggleSidebar, setOpenMobile } = useSidebar();
  const { data: user } = useCurrentUser();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }); // serverul șterge cookie-ul
    queryClient.clear(); // uităm datele utilizatorului vechi
    router.push("/"); // înapoi la pagina de start
  }

  return (
    <Sidebar>
      {/* Sus: logo + butonul de restrângere */}
      <SidebarHeader className={`flex-row items-center justify-between p-4 ${buildIn}`}>
        {/* Al doilea drum spre Home: click pe logo */}
        <button
          type="button"
          onClick={() => {
            setOpenMobile(false); // pe telefon închidem meniul
            router.push("/home");
          }}
          aria-label={t.sidebar.goHome}
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Logo className="size-10" />
        </button>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={t.sidebar.collapse}
          className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none"
        >
          <PanelLeftClose className="size-5" />
        </button>
      </SidebarHeader>

      {/* Mijloc: paginile */}
      <SidebarContent className={buildIn}>
        <nav className="flex flex-col gap-1.5 px-3 py-2">
          {PAGES.map((page) => (
            <SidebarLink key={page.href} href={page.href} icon={page.icon}>
              {t.sidebar[page.key]}
            </SidebarLink>
          ))}
        </nav>
      </SidebarContent>

      {/* Jos: cardul utilizatorului, cu meniu care se deschide în sus */}
      <SidebarFooter className={`p-3 ${buildIn}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sidebar-foreground transition-colors hover:bg-[var(--sidebar-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
            >
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-sm font-medium">{user?.username ?? "..."}</span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User /> {t.sidebar.profile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut /> {t.sidebar.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
