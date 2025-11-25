"use client";

import { useState } from "react";

type InsightsResponse = {
  text: string;
  stats?: any;
  error?: string;
};

export default function InsightsPage() {
  const [question, setQuestion] = useState(
    "Give me a performance summary for the current creator's IG → LTK → Amazon funnel this period. Focus on what's working and what to test next."
  );
  const [answer, setAnswer] = useState<string>("");
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function runInsights(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setStats(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data: InsightsResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Insights agent error");
      }

      setAnswer(data.text ?? "");
      setStats(data.stats ?? null);
    } catch (err: any) {
      setAnswer(`Error: ${err.message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="cm-section-title">AI Insights</h1>
      <p className="cm-section-subtitle">
        Ask the agent to read your IG → LTK → Amazon funnel and surface what
        actually matters. It uses the same normalized funnels that power the
        dashboard.
      </p>

      <form onSubmit={runInsights} className="cm-insights-form">
        <textarea
          className="cm-textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder="Ask things like: Which platform drove the most revenue? Where is the biggest drop in my funnel? What should I test next?"
        />
        <button
          type="submit"
          className="cm-ghost-button cm-ghost-button-strong"
          disabled={loading}
        >
          {loading ? "Thinking…" : "Ask the Insights Agent"}
        </button>
      </form>

      {answer && (
        <div className="cm-panel cm-insights-output">
          <div className="cm-panel-title">Agent response</div>
          <pre className="cm-codeblock cm-insights-text">{answer}</pre>
        </div>
      )}

      {stats && (
        <div className="cm-panel" style={{ marginTop: 12 }}>
          <div className="cm-panel-title">Underlying stats</div>
          <pre className="cm-codeblock">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
