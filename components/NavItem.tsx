'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavItem({ label, href }: { label: string; href: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm ${
        active
          ? 'bg-neutral-800 text-neutral-200'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
      }`}
    >
      {label}
    </Link>
  );
}
