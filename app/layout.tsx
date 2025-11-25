import './globals.css';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'CreatorMetrics',
  description: 'Full-funnel analytics for creators',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-50">
        <div className="flex min-h-screen">
          <div className="hidden md:block w-64 border-r border-neutral-800 bg-neutral-900/60">
            <Sidebar />
          </div>
          <div className="md:hidden fixed top-0 left-0 right-0 z-10">
            <MobileNav />
          </div>
          <main className="flex-1 px-4 md:px-8 py-6 md:ml-0 mt-12 md:mt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
