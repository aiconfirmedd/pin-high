import React from "react";
import { exportScorecardPng, exportScorecardPdf } from "../utils/exportScorecard";

interface Props {
  targetId: string;
  filename: string;
}

export default function ExportControls({ targetId, filename }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function doExport(type: "png" | "pdf") {
    setLoading(true);
    setError(null);
    try {
      if (type === "png") {
        await exportScorecardPng(targetId);
      } else {
        await exportScorecardPdf(targetId, filename);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button className="ghost-btn" disabled={loading} onClick={() => doExport("png")} style={{ fontSize: 13 }}>
        {loading ? "..." : "PNG"}
      </button>
      <button className="ghost-btn" disabled={loading} onClick={() => doExport("pdf")} style={{ fontSize: 13 }}>
        {loading ? "..." : "PDF"}
      </button>
      {error && <span style={{ color: "#ff4444", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
