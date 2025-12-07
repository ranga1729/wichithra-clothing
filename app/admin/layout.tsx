import AdminHeader from '@/components/admin/admin-header';
import { AppSidebar } from '@/components/admin/admin-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
    <SidebarProvider>
      <AppSidebar />
      <div className='flex flex-col w-full'>
        <AdminHeader/>

        <main className='border h-full'>
          {children}
        </main>
      </div>

    </SidebarProvider>
  );
}
