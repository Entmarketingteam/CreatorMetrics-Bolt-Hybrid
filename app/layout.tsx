import './globals.css';
import { Shell } from '../components/Shell';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'CreatorMetrics',
  description: 'Full-funnel analytics for creators',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-50">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
