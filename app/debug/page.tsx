import { getActiveFunnels, getMode, hasRealFunnels, getSelectedCreatorId } from "@/lib/funnelStore";

export default function DebugPage() {
  const funnels = getActiveFunnels();
  const mode = getMode();
  const hasReal = hasRealFunnels();
  const selected = getSelectedCreatorId();

  return (
    <div>
      <h1 className="cm-section-title">Debug</h1>
      <p className="cm-section-subtitle">
        Internal state of the funnel store. Not meant for end users.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-title">Store state</div>
        <pre className="cm-codeblock">
          {JSON.stringify(
            {
              mode,
              hasReal,
              selectedCreatorId: selected,
              funnelCount: funnels.length,
              creatorIds: funnels.map((f) => f.creatorId),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
