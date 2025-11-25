"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/creators", label: "Creators" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/agents", label: "Agents" },
  { href: "/upload", label: "Upload" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="cm-app-shell">
      {/* Sidebar */}
      <aside className="cm-sidebar">
        <div className="cm-sidebar-header">
          <div className="cm-logo-circle">CM</div>
          <div>
            <div className="cm-logo-text">CreatorMetrics</div>
            <div className="cm-logo-sub">v0.1 · Hackathon</div>
          </div>
        </div>

        <nav className="cm-nav">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "cm-nav-item" + (active ? " cm-nav-item-active" : "")
                }
              >
                <span className="cm-nav-dot" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="cm-sidebar-footer">
          <div className="cm-pill-badge">Dark Analytics</div>
          <div className="cm-footer-text">
            Built for creators who think like CMOs.
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="cm-main">
        <header className="cm-main-header">
          <div>
            <div className="cm-main-title">CreatorMetrics</div>
            <div className="cm-main-subtitle">
              IG → LTK → Amazon funnels, all in one place.
            </div>
          </div>
          <div className="cm-main-header-right">
            <button className="cm-ghost-button">Demo Mode</button>
            <div className="cm-avatar-circle">NE</div>
          </div>
        </header>

        <div className="cm-main-inner">{children}</div>
      </main>
    </div>
  );
}
