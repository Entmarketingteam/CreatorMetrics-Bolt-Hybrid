"use client";

import { useEffect, useState } from "react";

type Workspace = {
  id: string;
  name: string;
  managesMultipleCreators: boolean;
  connectedPlatforms: {
    instagram: boolean;
    ltk: boolean;
    amazon: boolean;
    tiktokShop: boolean;
  };
};

export default function SettingsPage() {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workspace");
        if (!res.ok) return;
        const json = (await res.json()) as Workspace;
        setWs(json);
        setName(json.name);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const json = (await res.json()) as Workspace;
        setWs(json);
      }
    } catch (err) {
      console.error("Failed to save workspace", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="cm-section-title">Workspace settings</h1>
      <p className="cm-section-subtitle">
        Rename your workspace and review your (fake) platform connections for the demo.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">General</div>
            <div className="cm-panel-subtitle">
              These settings affect your entire CreatorMetrics workspace.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="cm-login-label">
            Workspace name
            <input
              className="cm-login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ent Agency Creator Workspace"
            />
          </label>

          <button
            type="button"
            className="cm-ghost-button cm-ghost-button-strong"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Connections (demo only)</div>
            <div className="cm-panel-subtitle">
              In a real SaaS these would be OAuth connections. For the hackathon, they're just flags.
            </div>
          </div>
        </div>

        {ws ? (
          <div style={{ marginTop: 10, fontSize: 13, color: "#9ca3af" }}>
            <div>Instagram: {ws.connectedPlatforms.instagram ? "Connected" : "Not connected"}</div>
            <div>LTK: {ws.connectedPlatforms.ltk ? "Connected" : "Not connected"}</div>
            <div>Amazon: {ws.connectedPlatforms.amazon ? "Connected" : "Not connected"}</div>
            <div>
              TikTok Shop: {ws.connectedPlatforms.tiktokShop ? "Connected" : "Not connected"}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 13, color: "#9ca3af" }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
