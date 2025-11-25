"use client";

import { useState } from "react";

type AskAIButtonProps = {
  label?: string;
  defaultQuestion: string;
  scope?: "primary" | "all";
};

type InsightsResponse = {
  text: string;
};

export default function AskAIButton({
  label = "Ask AI about this",
  defaultQuestion,
  scope = "primary",
}: AskAIButtonProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(defaultQuestion);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, scope }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Insights failed");
      }
      const data: InsightsResponse = await res.json();
      setAnswer(data.text ?? "");
    } catch (err: any) {
      setAnswer(`Error: ${err.message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="cm-ghost-button"
        style={{ fontSize: 12, padding: "4px 10px", marginLeft: 8 }}
        onClick={() => setOpen(true)}
      >
        🤖 {label}
      </button>

      {open && (
        <div
          className="cm-command-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="cm-command-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cm-command-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 13, color: "#e5e7eb" }}>
                  Ask the Insights Agent
                </span>
                <button
                  type="button"
                  className="cm-ghost-button"
                  style={{ fontSize: 11, padding: "2px 8px" }}
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <textarea
                className="cm-textarea"
                style={{ marginTop: 6 }}
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                type="button"
                className="cm-ghost-button cm-ghost-button-strong"
                style={{ marginTop: 6 }}
                disabled={loading}
                onClick={run}
              >
                {loading ? "Analyzing…" : "Run analysis"}
              </button>
            </div>
            <div className="cm-command-body">
              {answer ? (
                <pre className="cm-codeblock cm-codeblock-prewrap">
                  {answer}
                </pre>
              ) : (
                <div className="cm-command-empty">
                  The agent will explain this funnel using your normalized
                  data.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
