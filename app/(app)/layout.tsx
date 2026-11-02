import { AppSidebar } from "@/frontend/components/app-sidebar";
import { PreferencesSync } from "@/frontend/components/preferences-sync";
import { SidebarOpenButton } from "@/frontend/components/sidebar-open-button";
import { SidebarProvider } from "@/frontend/components/ui/sidebar";

// Layout-ul comun pentru paginile de după login: sidebar în stânga, conținut în dreapta.
// Folderul (app) nu apare în URL: app/(app)/home/page.tsx → /home
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Aplică tema și accentul salvate în cont */}
      <PreferencesSync />
      <AppSidebar />
      <SidebarOpenButton />
      {/* pt-16: loc pentru butonul din stânga sus când meniul e închis */}
      <main className="flex min-w-0 flex-1 flex-col bg-background px-4 pt-16 pb-8 sm:px-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
