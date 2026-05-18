import React from "react";
import type { Club, ClubStatus } from "../types";
import { saveClubs } from "../utils/localStorageStore";

interface Props {
  clubs: Club[];
  onClubsChange: (clubs: Club[]) => void;
}

const STATUS_OPTIONS: { value: ClubStatus; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "reliable", label: "Reliable" },
  { value: "inconsistent", label: "Inconsistent" },
  { value: "needs-distance", label: "Needs Distance Work" },
];

function statusColor(status: ClubStatus): string {
  if (status === "reliable") return "#4caf50";
  if (status === "inconsistent") return "var(--orange)";
  if (status === "needs-distance") return "#ff4444";
  return "var(--muted)";
}

function statusCardClass(status: ClubStatus): string {
  if (status === "reliable") return "club-card club-card-reliable";
  if (status === "inconsistent") return "club-card club-card-inconsistent";
  if (status === "needs-distance") return "club-card club-card-needs-dist";
  return "club-card";
}

export default function ClubPerformanceMap({ clubs, onClubsChange }: Props) {
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<Club | null>(null);

  function openEdit(club: Club) {
    setEditId(club.id);
    setEditData({ ...club });
  }

  function closeEdit() {
    setEditId(null);
    setEditData(null);
  }

  function saveEdit() {
    if (!editData) return;
    const next = clubs.map(c => c.id === editData.id ? editData : c);
    onClubsChange(next);
    saveClubs(next);
    closeEdit();
  }

  function updateEdit<K extends keyof Club>(field: K, value: Club[K]) {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  }

  function numOrEmpty(val: string): number | "" {
    const n = parseInt(val, 10);
    return isNaN(n) ? "" : n;
  }

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>Club Performance Map</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {clubs.map(club => (
          <div
            key={club.id}
            className={statusCardClass(club.status)}
            onClick={() => openEdit(club)}
          >
            <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 14 }}>{club.name}</div>
            <div style={{ color: "var(--sec)", fontSize: 12, marginTop: 2 }}>{club.spec}</div>
            <div style={{
              marginTop: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              color: statusColor(club.status)
            }}>
              {STATUS_OPTIONS.find(s => s.value === club.status)?.label ?? club.status}
            </div>
            {club.mainMiss && (
              <div style={{ color: "var(--sec)", fontSize: 12, marginTop: 4 }}>Miss: {club.mainMiss}</div>
            )}
            {club.carryDist !== "" && (
              <div style={{ color: "var(--sec)", fontSize: 12, marginTop: 2 }}>Carry: {club.carryDist} yds</div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map(s => (
          <div key={s.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: statusColor(s.value) }} />
            <span style={{ color: "var(--sec)", fontSize: 12 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editId && editData && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="card" style={{ maxWidth: 460, width: "92%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>{editData.name}</span>
              <button className="modal-close-btn" onClick={closeEdit}>✕</button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ color: "var(--sec)", fontSize: 13 }}>{editData.spec}</div>

              {/* Status toggle */}
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Status</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateEdit("status", s.value)}
                      style={{
                        padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                        border: `2px solid ${editData.status === s.value ? statusColor(s.value) : "var(--grid)"}`,
                        background: editData.status === s.value ? "rgba(232,119,34,0.1)" : "transparent",
                        color: editData.status === s.value ? statusColor(s.value) : "var(--sec)",
                        cursor: "pointer"
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Main Miss</label>
                <input className="form-input" value={editData.mainMiss}
                  onChange={e => updateEdit("mainMiss", e.target.value)}
                  placeholder="e.g. Block right, Thin, Pull left" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Approach (yds)</label>
                  <input className="form-input" type="number"
                    value={editData.approachDist === "" ? "" : editData.approachDist}
                    onChange={e => updateEdit("approachDist", numOrEmpty(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Carry (yds)</label>
                  <input className="form-input" type="number"
                    value={editData.carryDist === "" ? "" : editData.carryDist}
                    onChange={e => updateEdit("carryDist", numOrEmpty(e.target.value))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total (yds)</label>
                  <input className="form-input" type="number"
                    value={editData.totalDist === "" ? "" : editData.totalDist}
                    onChange={e => updateEdit("totalDist", numOrEmpty(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock (yds)</label>
                  <input className="form-input" type="number"
                    value={editData.stockDist === "" ? "" : editData.stockDist}
                    onChange={e => updateEdit("stockDist", numOrEmpty(e.target.value))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Partial (yds)</label>
                <input className="form-input" type="number"
                  value={editData.partialDist === "" ? "" : editData.partialDist}
                  onChange={e => updateEdit("partialDist", numOrEmpty(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={e => updateEdit("notes", e.target.value)}
                  rows={3}
                  style={{
                    width: "100%", background: "var(--surface2)", border: "1px solid var(--grid)",
                    borderRadius: 8, padding: "10px 12px", color: "var(--white)", fontSize: 14,
                    resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="cta-btn" style={{ flex: 1 }} onClick={saveEdit}>Save</button>
                <button className="ghost-btn" style={{ flex: 1 }} onClick={closeEdit}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
