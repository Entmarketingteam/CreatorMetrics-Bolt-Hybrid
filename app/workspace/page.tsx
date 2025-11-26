"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
};

type Workspace = {
  id: string;
  name: string;
  members: Member[];
};

export default function WorkspacePage() {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workspace");
        if (!res.ok) return;
        const json = await res.json();
        setWs(json);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function addMember() {
    if (!ws || !email.trim()) return;
    setSaving(true);
    try {
      const members = [
        ...(ws.members ?? []),
        {
          id: `member_${Date.now()}`,
          email: email.trim(),
          role,
        },
      ];
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });
      if (res.ok) {
        const json = await res.json();
        setWs(json);
        setEmail("");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!ws) {
    return (
      <div>
        <h1 className="cm-section-title">Workspace</h1>
        <p className="cm-section-subtitle">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cm-section-title">Workspace</h1>
      <p className="cm-section-subtitle">
        Manage your CreatorMetrics workspace and collaborators.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Team members</div>
            <div className="cm-panel-subtitle">
              Invite teammates to view insights and funnels.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <table className="cm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {(ws.members ?? []).map((m) => (
                <tr key={m.id}>
                  <td>{m.email}</td>
                  <td>{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            className="cm-login-input"
            style={{ maxWidth: 260 }}
            placeholder="new.teammate@brand.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="cm-select"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="button"
            className="cm-ghost-button cm-ghost-button-strong"
            disabled={saving}
            onClick={addMember}
          >
            {saving ? "Adding…" : "Add member"}
          </button>
        </div>
      </div>
    </div>
  );
}
