"use client";

import { useState, useEffect } from "react";

type Member = {
  email: string;
  role: "owner" | "editor" | "viewer";
};

export default function WorkspacePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Member["role"]>("viewer");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/workspace");
      const json = await res.json().catch(() => ({}));
      setMembers(json.members ?? []);
    })();
  }, []);

  async function addMember() {
    if (!newEmail) return;

    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, role: newRole }),
    });

    if (res.ok) {
      const json = await res.json();
      setMembers(json.members);
      setNewEmail("");
      setNewRole("viewer");
    }
  }

  return (
    <div>
      <h1 className="cm-section-title">Workspace</h1>
      <p className="cm-section-subtitle">
        Manage collaborators and their roles.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Team members</div>
          </div>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i}>
                  <td>{m.email}</td>
                  <td>{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new member */}
        <div style={{ marginTop: 20 }}>
          <input
            className="cm-input"
            style={{ marginRight: 8 }}
            placeholder="member@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <select
            className="cm-select"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as any)}
          >
            <option value="owner">Owner</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <button className="cm-ghost-button" onClick={addMember}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
