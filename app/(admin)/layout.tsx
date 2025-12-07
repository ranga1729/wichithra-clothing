import { AdminSidebar } from '@/components/admin-sidebar'; 
import { AdminHeader } from '@/components/admin-header';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className='flex flex-col'>
          <AdminHeader />
          <div className="flex flex-1">
            <AdminSidebar />
            <SidebarInset>
              <main className='flex flex-col w-full h-full'>
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </ThemeProvider>

  );
}
