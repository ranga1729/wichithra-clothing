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
    <div>
      <header>
        <h1>Header</h1>
      </header>

      <main>
        <div className='flex flex-row'>
          <h1>sidebar</h1>
          {children}
        </div>
      </main>

      <footer>
        <h1>footer</h1>
      </footer>
    </div>
  );
}
