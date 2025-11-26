"use client";

import { useEffect, useState } from "react";

type UploadRecord = {
  id: string;
  createdAt: string;
  files: string[];
  creatorsDetected: number;
  status: "processed" | "failed";
};

export default function UploadsPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/uploads");
        if (!res.ok) return;
        const json = await res.json();
        setUploads(json.uploads ?? []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="cm-section-title">Upload history</h1>
      <p className="cm-section-subtitle">
        See previous IG / LTK / Amazon exports and how many creators were
        detected.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Recent uploads</div>
          </div>
        </div>

        {uploads.length === 0 ? (
          <p className="cm-section-subtitle" style={{ marginTop: 10 }}>
            No uploads yet. Upload exports to populate history.
          </p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Files</th>
                  <th>Creators</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {new Date(u.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{u.files.join(", ") || "—"}</td>
                    <td>{u.creatorsDetected}</td>
                    <td>{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
