'use client';

import { useState } from 'react';
import NavItem from './NavItem';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold">CreatorMetrics</div>
        <button
          className="text-neutral-400"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </div>
      {open && (
        <nav className="px-4 pb-3 space-y-1 text-sm">
          <NavItem label="Dashboard" href="/dashboard" />
          <NavItem label="Creators" href="/creators" />
          <NavItem label="Campaigns" href="/campaigns" />
          <NavItem label="Agents" href="/agents" />
          <NavItem label="Upload" href="/upload" />
        </nav>
      )}
    </div>
  );
}
