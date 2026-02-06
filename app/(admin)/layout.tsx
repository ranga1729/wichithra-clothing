import { AdminSidebar } from '@/components/custom/admin/admin-sidebar'; 
import { AdminHeader } from '@/components/custom/admin/admin-header';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { getUserFromCookie } from '@/lib/get-cookie';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className='flex flex-col'>
          <AdminHeader user={user} />
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
