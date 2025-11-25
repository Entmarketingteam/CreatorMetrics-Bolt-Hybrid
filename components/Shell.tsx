"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/creators", label: "Creators" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/insights", label: "Insights" },
  { href: "/agents", label: "Agents" },
  { href: "/upload", label: "Upload" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [hasReal, setHasReal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [creators, setCreators] = useState<
    { id: string; name: string; handle?: string }[]
  >([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/mode");
        if (!res.ok) return;
        const json = await res.json();
        setMode(json.mode);
        setHasReal(json.hasReal ?? false);
      } catch {
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCreators() {
      try {
        const res = await fetch("/api/creators");
        if (!res.ok) return;
        const json = await res.json();
        setCreators(json.creators ?? []);
        setSelectedCreatorId(json.selectedCreatorId ?? null);
      } catch {
      }
    }
    loadCreators();
  }, []);

  async function toggleMode() {
    if (toggling) return;
    if (!hasReal && mode === "demo") {
      return;
    }

    setToggling(true);
    try {
      const res = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: mode === "demo" ? "real" : "demo",
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.warn("Mode switch error", json);
        return;
      }
      const json = await res.json();
      setMode(json.mode);
      setHasReal(json.hasReal ?? hasReal);
    } catch (err) {
      console.error("Mode switch failed", err);
    } finally {
      setToggling(false);
    }
  }

  async function handleCreatorChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const id = e.target.value || "";
    const next = id || null;
    setSelectedCreatorId(next);
    try {
      await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: next }),
      });
    } catch (err) {
      console.error("Failed to set creator", err);
    }
  }

  async function handleReset() {
    if (resetting) return;
    setResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Reset failed", err);
    } finally {
      setResetting(false);
    }
  }

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
            {creators.length > 0 && (
              <select
                className="cm-select"
                value={selectedCreatorId ?? ""}
                onChange={handleCreatorChange}
              >
                <option value="">All creators</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <button
              className={
                "cm-ghost-button" +
                (mode === "real" ? " cm-ghost-button-live" : "")
              }
              onClick={toggleMode}
              disabled={toggling || (!hasReal && mode === "demo")}
            >
              {!hasReal
                ? "Demo Only"
                : mode === "real"
                ? "Live Data"
                : "Demo Mode"}
            </button>

            <button
              className="cm-ghost-button"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? "Resetting…" : "Reset data"}
            </button>

            <div className="cm-avatar-circle">NE</div>
          </div>
        </header>

        <div className="cm-main-inner">{children}</div>
      </main>
    </div>
  );
}
