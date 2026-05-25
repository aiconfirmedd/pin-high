import React from "react";
import type { Club, ClubStatus } from "../types";
import { saveClubs } from "../utils/localStorageStore";
import { matchBrands, matchModels, formatSpec, CLUB_SLOT_NAMES } from "../data/clubData";

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

function numOrEmpty(v: string): number | "" {
  const n = parseFloat(v);
  return isNaN(n) ? "" : n;
}

// âââ Autocomplete spec picker ââââââââââââââââââââââââââââââââââââââââââââââââ
interface SpecPickerProps {
  value: string;
  onChange: (spec: string) => void;
}

function SpecPicker({ value, onChange }: SpecPickerProps) {
  const [brandQuery, setBrandQuery] = React.useState(() => {
    // Try to prefill brand from existing spec
    const parts = value.split(" ");
    return parts.length > 1 ? parts[0] : "";
  });
  const [selectedBrand, setSelectedBrand] = React.useState(() => {
    // Try to detect brand from value
    const brands = matchBrands("");
    return brands.find(b => value.toLowerCase().startsWith(b.toLowerCase())) || "";
  });
  const [modelQuery, setModelQuery] = React.useState(() => {
    if (!value) return "";
    const brand = matchBrands("").find(b => value.toLowerCase().startsWith(b.toLowerCase())) || "";
    return brand ? value.substring(brand.length).trim() : value;
  });
  const [showBrands, setShowBrands] = React.useState(false);
  const [showModels, setShowModels] = React.useState(false);

  const brandSuggestions = React.useMemo(
    () => matchBrands(brandQuery),
    [brandQuery]
  );
  const modelSuggestions = React.useMemo(
    () => selectedBrand ? matchModels(selectedBrand, modelQuery) : [],
    [selectedBrand, modelQuery]
  );

  function handleBrandInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setBrandQuery(v);
    setSelectedBrand("");
    setModelQuery("");
    setShowBrands(true);
    onChange(v);
  }

  function pickBrand(brand: string) {
    setSelectedBrand(brand);
    setBrandQuery(brand);
    setShowBrands(false);
    setModelQuery("");
    setShowModels(true);
    onChange(brand);
  }

  function handleModelInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setModelQuery(v);
    setShowModels(true);
    onChange(selectedBrand ? formatSpec(selectedBrand, v) : v);
  }

  function pickModel(brand: string, model: string) {
    const spec = formatSpec(brand, model);
    setModelQuery(model);
    setShowModels(false);
    onChange(spec);
  }

  const dropStyle: React.CSSProperties = {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
    background: "var(--surface2)", border: "1px solid var(--grid)",
    borderRadius: 8, maxHeight: 180, overflowY: "auto",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  };
  const dropItemStyle: React.CSSProperties = {
    padding: "10px 14px", cursor: "pointer", fontSize: 14, color: "var(--white)",
    borderBottom: "1px solid var(--grid)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Brand picker */}
      <div style={{ position: "relative" }}>
        <label className="form-label" style={{ marginBottom: 4 }}>Brand</label>
        <input
          className="form-input"
          placeholder="e.g. Titleist, TaylorMade..."
          value={brandQuery}
          onChange={handleBrandInput}
          onFocus={() => setShowBrands(true)}
          onBlur={() => setTimeout(() => setShowBrands(false), 180)}
          autoComplete="off"
        />
        {showBrands && brandSuggestions.length > 0 && (
          <div style={dropStyle}>
            {brandSuggestions.map(b => (
              <div
                key={b}
                style={{
                  ...dropItemStyle,
                  background: b === selectedBrand ? "rgba(232,119,34,0.15)" : "transparent",
                  color: b === selectedBrand ? "var(--orange)" : "var(--white)",
                }}
                onMouseDown={() => pickBrand(b)}
              >
                {b}
              </div>
            ))}
            <div
              style={{ ...dropItemStyle, color: "var(--sec)", fontStyle: "italic" }}
              onMouseDown={() => { setShowBrands(false); onChange(brandQuery); }}
            >
              Use "{brandQuery}" (manual)
            </div>
          </div>
        )}
      </div>

      {/* Model picker â shown after brand selected or manual entry */}
      <div style={{ position: "relative" }}>
        <label className="form-label" style={{ marginBottom: 4 }}>Model</label>
        <input
          className="form-input"
          placeholder={selectedBrand ? "e.g. P790, SM10..." : "Enter model or full spec"}
          value={modelQuery}
          onChange={handleModelInput}
          onFocus={() => setShowModels(true)}
          onBlur={() => setTimeout(() => setShowModels(false), 180)}
          autoComplete="off"
        />
        {showModels && modelSuggestions.length > 0 && (
          <div style={dropStyle}>
            {modelSuggestions.map(m => (
              <div
                key={m.model}
                style={dropItemStyle}
                onMouseDown={() => pickModel(m.brand, m.model)}
              >
                <span style={{ fontWeight: 600 }}>{m.model}</span>
                <span style={{ color: "var(--sec)", fontSize: 12, marginLeft: 8 }}>{m.type} Â· {m.years}</span>
              </div>
            ))}
            <div
              style={{ ...dropItemStyle, color: "var(--sec)", fontStyle: "italic" }}
              onMouseDown={() => setShowModels(false)}
            >
              Use "{modelQuery}" (manual)
            </div>
          </div>
        )}
      </div>

      {/* Final spec preview */}
      {value && (
        <div style={{ fontSize: 12, color: "var(--orange)", paddingLeft: 2 }}>
          Spec: {value}
        </div>
      )}
    </div>
  );
}

// âââ Add Club Modal ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
interface AddClubModalProps {
  onAdd: (club: Club) => void;
  onClose: () => void;
}

function AddClubModal({ onAdd, onClose }: AddClubModalProps) {
  const [slotQuery, setSlotQuery] = React.useState("");
  const [slotName, setSlotName] = React.useState("");
  const [showSlots, setShowSlots] = React.useState(false);
  const [spec, setSpec] = React.useState("");

  const slotSuggestions = React.useMemo(() => {
    const q = slotQuery.toLowerCase();
    if (!q) return CLUB_SLOT_NAMES.slice(0, 10);
    return CLUB_SLOT_NAMES.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
  }, [slotQuery]);

  function handleAdd() {
    const name = slotName.trim() || slotQuery.trim();
    if (!name) return;
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name,
      spec: spec.trim(),
      status: "normal",
      mainMiss: "",
      approachDist: "",
      carryDist: "",
      totalDist: "",
      stockDist: "",
      partialDist: "",
      notes: "",
    };
    onAdd(newClub);
    onClose();
  }

  const dropStyle: React.CSSProperties = {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
    background: "var(--surface2)", border: "1px solid var(--grid)",
    borderRadius: 8, maxHeight: 180, overflowY: "auto",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  };
  const dropItemStyle: React.CSSProperties = {
    padding: "10px 14px", cursor: "pointer", fontSize: 14,
    color: "var(--white)", borderBottom: "1px solid var(--grid)",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card"
        style={{ maxWidth: 420, width: "92%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>Add Club</span>
          <button className="modal-close-btn" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Slot name */}
          <div style={{ position: "relative" }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Club Slot</label>
            <input
              className="form-input"
              placeholder="e.g. Driver, 7 Iron, SW (54 deg)..."
              value={slotQuery}
              onChange={e => { setSlotQuery(e.target.value); setSlotName(""); setShowSlots(true); }}
              onFocus={() => setShowSlots(true)}
              onBlur={() => setTimeout(() => setShowSlots(false), 180)}
              autoComplete="off"
            />
            {showSlots && slotSuggestions.length > 0 && (
              <div style={dropStyle}>
                {slotSuggestions.map(s => (
                  <div
                    key={s}
                    style={{ ...dropItemStyle, background: s === slotName ? "rgba(232,119,34,0.15)" : "transparent" }}
                    onMouseDown={() => { setSlotName(s); setSlotQuery(s); setShowSlots(false); }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand + Model autocomplete */}
          <SpecPicker value={spec} onChange={setSpec} />

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              className="cta-btn"
              style={{ flex: 1, opacity: (slotName || slotQuery).trim() ? 1 : 0.5 }}
              onClick={handleAdd}
            >
              Add Club
            </button>
            <button className="ghost-btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// âââ Main Component ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function ClubPerformanceMap({ clubs, onClubsChange }: Props) {
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<Club | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

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

  function deleteClub(id: string) {
    const next = clubs.filter(c => c.id !== id);
    onClubsChange(next);
    saveClubs(next);
  }

  function handleAddClub(club: Club) {
    const next = [...clubs, club];
    onClubsChange(next);
    saveClubs(next);
  }

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingRight: 4 }}>
        <div>
          <div className="section-title" style={{ marginBottom: 2 }}>Club Bag</div>
          <div style={{ color: "var(--sec)", fontSize: 13 }}>{clubs.length} clubs</div>
        </div>
        <button
          className="cta-btn"
          style={{ padding: "10px 18px", fontSize: 14 }}
          onClick={() => setShowAddModal(true)}
        >
          + Add Club
        </button>
      </div>

      {/* Club cards grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clubs.map(club => (
          <div
            key={club.id}
            className={statusCardClass(club.status)}
            style={{ cursor: "pointer" }}
            onClick={() => openEdit(club)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--white)" }}>{club.name}</span>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                      background: `${statusColor(club.status)}22`,
                      color: statusColor(club.status), flexShrink: 0,
                    }}
                  >
                    {club.status.replace("-", " ")}
                  </span>
                </div>
                {club.spec && (
                  <div style={{ color: "var(--sec)", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {club.spec}
                  </div>
                )}
                {(club.carryDist !== "" || club.stockDist !== "") && (
                  <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
                    {club.carryDist !== "" && <span>Carry: {club.carryDist}y</span>}
                    {club.stockDist !== "" && <span>Stock: {club.stockDist}y</span>}
                    {club.approachDist !== "" && <span>Approach: {club.approachDist}y</span>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                <button
                  className="ghost-btn"
                  style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); openEdit(club); }}
                >
                  Edit
                </button>
                <button
                  className="ghost-btn"
                  style={{ padding: "6px 10px", fontSize: 12, color: "#ff4444", borderColor: "#ff444440" }}
                  onClick={e => { e.stopPropagation(); deleteClub(club.id); }}
                >
                  &#x2715;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Club Modal */}
      {showAddModal && (
        <AddClubModal onAdd={handleAddClub} onClose={() => setShowAddModal(false)} />
      )}

      {/* Edit modal */}
      {editId && editData && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="card" style={{ maxWidth: 460, width: "92%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>{editData.name}</span>
              <button className="modal-close-btn" onClick={closeEdit}>&#x2715;</button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Spec autocomplete */}
              <SpecPicker
                value={editData.spec}
                onChange={v => updateEdit("spec", v)}
              />

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
                  placeholder="e.g. pull, push, thin..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                  placeholder="Tendencies, swing notes..."
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
