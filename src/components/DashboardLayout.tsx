import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader />
          <div className="container mx-auto px-4 py-2">
            <SidebarTrigger className="mb-4" />
          </div>
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
