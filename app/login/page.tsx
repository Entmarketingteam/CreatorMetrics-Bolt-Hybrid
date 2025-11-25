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
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
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
            {loading ? "Entering…" : "Continue with demo data"}
          </button>
        </form>
      </div>
    </div>
  );
}
