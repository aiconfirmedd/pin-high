import React from "react";
import type { Round, Hole, HoleFIR, HoleGIR, HoleUD, HoleSS } from "../types";
import HandwritingPadModal from "./HandwritingPadModal";

interface Props {
  round: Round;
  holeIndex: number;
  onSave: (hole: Hole) => void;
  onClose: () => void;
}

type FieldId = "fir" | "gir" | "putts" | "score" | "upDown" | "sandSave";

interface FieldDef {
  id: FieldId;
  label: string;
  hint: string;
}

const ALL_FIELDS: FieldDef[] = [
  { id: "fir", label: "Fairway Hit?", hint: "Draw ✓ for hit, X for miss" },
  { id: "gir", label: "Green in Regulation?", hint: "Draw ✓ for hit, X for miss" },
  { id: "putts", label: "Putts", hint: "Draw the number of putts (1, 2, 3...)" },
  { id: "score", label: "Score", hint: "Draw your gross score for this hole" },
  { id: "upDown", label: "Up & Down?", hint: "Draw ✓ for made, X for missed, — for N/A" },
  { id: "sandSave", label: "Sand Save?", hint: "Draw ✓ for made, X for missed, — for N/A" },
];

export default function GuidedHoleEntry({ round, holeIndex, onSave, onClose }: Props) {
  const hole = round.holes[holeIndex];
  const isPar3 = hole.par === 3;

  const fields = isPar3 ? ALL_FIELDS.filter(f => f.id !== "fir") : ALL_FIELDS;
  const [fieldIdx, setFieldIdx] = React.useState(0);
  const [values, setValues] = React.useState<Partial<Hole>>({
    fir: hole.fir,
    gir: hole.gir,
    putts: hole.putts,
    score: hole.score,
    upDown: hole.upDown,
    sandSave: hole.sandSave,
  });

  const currentField = fields[fieldIdx];

  function getDisplayValue(fid: FieldId): string {
    const v = values[fid];
    if (v === undefined || v === "") return "·";
    return String(v);
  }

  function parseDetected(fid: FieldId, raw: string): Partial<Hole> {
    if (fid === "fir") {
      const v: HoleFIR = raw === "hit" ? "hit" : raw === "miss" ? "miss" : raw === "dash" ? "na" : "";
      return { fir: v };
    }
    if (fid === "gir") {
      const v: HoleGIR = raw === "hit" ? "hit" : raw === "miss" ? "miss" : "";
      return { gir: v };
    }
    if (fid === "upDown") {
      const v: HoleUD = raw === "hit" ? "made" : raw === "miss" ? "missed" : raw === "dash" ? "dash" : "";
      return { upDown: v };
    }
    if (fid === "sandSave") {
      const v: HoleSS = raw === "hit" ? "made" : raw === "miss" ? "missed" : raw === "dash" ? "dash" : "";
      return { sandSave: v };
    }
    // numeric
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      return { [fid]: n } as Partial<Hole>;
    }
    return {};
  }

  function handleDetect(raw: string) {
    const parsed = parseDetected(currentField.id, raw);
    setValues(prev => ({ ...prev, ...parsed }));
    // Move to next field
    if (fieldIdx < fields.length - 1) {
      setFieldIdx(fieldIdx + 1);
    }
  }

  function handleSave() {
    const updated: Hole = {
      ...hole,
      fir: (values.fir ?? hole.fir) as HoleFIR,
      gir: (values.gir ?? hole.gir) as HoleGIR,
      putts: values.putts ?? hole.putts,
      score: values.score ?? hole.score,
      upDown: (values.upDown ?? hole.upDown) as HoleUD,
      sandSave: (values.sandSave ?? hole.sandSave) as HoleSS,
    };
    onSave(updated);
  }

  function skip() {
    if (fieldIdx < fields.length - 1) {
      setFieldIdx(fieldIdx + 1);
    } else {
      handleSave();
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)", zIndex: 200,
      display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div className="screen-header">
        <button className="back-btn" onClick={onClose}>
          <span className="back-btn-chevron">‹</span>
          <span>Scorecard</span>
        </button>
        <span className="screen-header-title">
          Hole {hole.number} · Par {hole.par !== "" ? hole.par : "—"}
        </span>
        <div className="screen-header-action">
          <span style={{ color: "var(--sec)", fontSize: 13 }}>
            {hole.yards !== "" ? `${hole.yards}y` : ""}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="field-progress">
        {fields.map((f, i) => (
          <div
            key={f.id}
            className={`field-dot ${i === fieldIdx ? "field-dot-active" : i < fieldIdx ? "field-dot-done" : ""}`}
            onClick={() => setFieldIdx(i)}
          />
        ))}
      </div>

      {/* Value chips */}
      <div className="val-chips-row">
        {fields.map((f, i) => (
          <div
            key={f.id}
            className={`val-chip ${i === fieldIdx ? "val-chip-active" : ""} ${getDisplayValue(f.id) !== "·" ? "val-chip-set" : ""}`}
            onClick={() => setFieldIdx(i)}
          >
            <div style={{ fontSize: 10, color: "var(--sec)", marginBottom: 2 }}>{f.label.toUpperCase().slice(0, 5)}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{getDisplayValue(f.id)}</div>
          </div>
        ))}
      </div>

      {/* Handwriting pad */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <HandwritingPadModal
          label={currentField.label}
          hint={currentField.hint}
          onDetect={handleDetect}
          onClose={onClose}
        />
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 20px 32px", display: "flex", gap: 10 }}>
        {fieldIdx < fields.length - 1 ? (
          <>
            <button className="secondary-btn" style={{ flex: 1 }} onClick={skip}>Skip →</button>
            <button className="cta-btn" style={{ flex: 2 }} onClick={handleSave}>Save & Close</button>
          </>
        ) : (
          <button className="cta-btn" style={{ flex: 1 }} onClick={handleSave}>Save Hole</button>
        )}
      </div>
    </div>
  );
}
