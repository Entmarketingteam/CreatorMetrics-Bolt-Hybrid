"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const PUBLIC_PATHS = ["/login", "/setup", "/share"];

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/creators", label: "Creators" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/insights", label: "Insights" },
  { href: "/agents", label: "Agents" },
  { href: "/upload", label: "Upload" },
  { href: "/uploads", label: "Upload History" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/workspace", label: "Workspace" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [hasReal, setHasReal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [creators, setCreators] = useState<
    { id: string; name: string; handle?: string }[]
  >([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandResults, setCommandResults] = useState<
    { type: "creator" | "page"; label: string; sub?: string; href: string }[]
  >([]);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) =>
      pathname === p || pathname.startsWith(p + "/")
    );
    if (isPublic) {
      setAuthChecked(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          setAuthChecked(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    })();
  }, [pathname, router]);

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

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
        setCommandQuery("");
        setCommandResults([]);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
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

  async function runCommandSearch(q: string) {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) {
      setCommandResults([]);
      return;
    }

    const basePages: { type: "page"; label: string; sub?: string; href: string }[] =
      [
        { type: "page", label: "Dashboard", sub: "Overview", href: "/dashboard" },
        { type: "page", label: "Creators", sub: "All creators", href: "/creators" },
        { type: "page", label: "Upload", sub: "Ingest exports", href: "/upload" },
        { type: "page", label: "AI Insights", sub: "Ask the agent", href: "/insights" },
        { type: "page", label: "Setup wizard", sub: "Workspace", href: "/setup" },
        { type: "page", label: "Settings", sub: "Workspace settings", href: "/settings" },
      ];

    const pageMatches = basePages.filter(
      (p) =>
        p.label.toLowerCase().includes(trimmed) ||
        (p.sub ?? "").toLowerCase().includes(trimmed)
    );

    let creatorMatches: { type: "creator"; label: string; sub?: string; href: string }[] = [];

    try {
      const res = await fetch("/api/creators");
      if (res.ok) {
        const data = await res.json();
        const creators = (data.creators ?? []) as {
          id: string;
          name: string;
          handle?: string;
        }[];

        creatorMatches = creators
          .filter(
            (c) =>
              c.name.toLowerCase().includes(trimmed) ||
              (c.handle ?? "").toLowerCase().includes(trimmed)
          )
          .map((c) => ({
            type: "creator" as const,
            label: c.name,
            sub: c.handle ?? "",
            href: `/creators/${c.id}`,
          }));
      }
    } catch {
      // ignore
    }

    setCommandResults([...creatorMatches, ...pageMatches].slice(0, 8));
  }

  if (!authChecked) {
    return null;
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
              type="button"
              className="cm-ghost-button"
              onClick={() => {
                setIsCommandOpen(true);
                setCommandQuery("");
                setCommandResults([]);
              }}
            >
              ⌘K Search
            </button>

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

            <button
              type="button"
              className="cm-ghost-button"
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                router.push("/login");
              }}
            >
              Logout
            </button>

            <div className="cm-avatar-circle">NE</div>
          </div>
        </header>

        <div className="cm-main-inner">{children}</div>
      </main>

      {isCommandOpen && (
        <div
          className="cm-command-overlay"
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            className="cm-command-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cm-command-header">
              <input
                autoFocus
                className="cm-command-input"
                placeholder="Search creators, pages… (Cmd/Ctrl + K)"
                value={commandQuery}
                onChange={(e) => {
                  const q = e.target.value;
                  setCommandQuery(q);
                  runCommandSearch(q);
                }}
              />
            </div>
            <div className="cm-command-body">
              {commandResults.length === 0 ? (
                <div className="cm-command-empty">Start typing to search…</div>
              ) : (
                <ul className="cm-command-list">
                  {commandResults.map((item, idx) => (
                    <li
                      key={idx}
                      className="cm-command-item"
                      onClick={() => {
                        setIsCommandOpen(false);
                        router.push(item.href);
                      }}
                    >
                      <div className="cm-command-item-label">
                        {item.label}
                      </div>
                      {item.sub && (
                        <div className="cm-command-item-sub">
                          {item.sub}
                        </div>
                      )}
                      <div className="cm-command-item-tag">
                        {item.type === "creator" ? "Creator" : "Page"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
