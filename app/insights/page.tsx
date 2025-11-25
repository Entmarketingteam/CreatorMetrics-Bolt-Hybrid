"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [question, setQuestion] = useState(
    "Give me a performance summary for Nicki's IG → LTK → Amazon funnel this period. Focus on what's working and what to test next."
  );
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runInsights(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "insights",
          query: question,
        }),
      });

      if (!res.ok) throw new Error("Agent error");
      const data = await res.json();
      setAnswer(data.text ?? JSON.stringify(data, null, 2));
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
        Ask the agent to interpret your funnel and surface what matters.
        (Uses demo data for now.)
      </p>

      <form onSubmit={runInsights} className="cm-insights-form">
        <textarea
          className="cm-textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
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
          <pre className="cm-codeblock">{answer}</pre>
        </div>
      )}
    </div>
  );
}
