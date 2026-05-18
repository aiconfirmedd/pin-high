import React from "react";
import type { CoursePreset } from "../types";
import { loadPresets, deletePreset } from "../utils/localStorageStore";

interface Props {
  onLoad: (preset: CoursePreset) => void;
  onClose: () => void;
}

export default function SavedPresets({ onLoad, onClose }: Props) {
  const [presets, setPresets] = React.useState<CoursePreset[]>(() => loadPresets());

  function handleDelete(id: string) {
    deletePreset(id);
    setPresets(loadPresets());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: "90%", maxHeight: "80vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>Saved Presets</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          {presets.length === 0 && (
            <p style={{ color: "var(--sec)", textAlign: "center", padding: "24px 0" }}>
              No saved presets yet. Set up a course and save it as a preset.
            </p>
          )}
          {presets.map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: "1px solid var(--grid)"
            }}>
              <div>
                <div style={{ color: "var(--white)", fontWeight: 600 }}>{p.courseName}</div>
                <div style={{ color: "var(--sec)", fontSize: 13 }}>{p.teeName} {p.teeDistance !== "" ? `· ${p.teeDistance} yds` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="cta-btn" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => onLoad(p)}>
                  Load
                </button>
                <button className="ghost-btn" style={{ padding: "6px 10px", fontSize: 13 }}
                  onClick={() => handleDelete(p.id)}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
