"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      router.push("/setup");
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cm-login-wrap">
      <div className="cm-login-card">
        <div className="cm-logo-circle">CM</div>
        <h1 className="cm-section-title" style={{ marginTop: 12 }}>
          CreatorMetrics
        </h1>
        <p className="cm-section-subtitle">
          Sign in to your creator analytics workspace.
        </p>

        <form onSubmit={onSubmit} className="cm-login-form">
          <label className="cm-login-label">
            Work email
            <input
              type="email"
              required
              className="cm-login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
            />
          </label>
          <button
            type="submit"
            className="cm-ghost-button cm-ghost-button-strong"
            disabled={loading}
          >
            {loading ? "Entering…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
