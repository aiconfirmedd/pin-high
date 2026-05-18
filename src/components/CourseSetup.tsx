import React from "react";
import type { Round, CoursePreset, Hole } from "../types";
import { savePreset } from "../utils/localStorageStore";
import SavedPresets from "./SavedPresets";
import PhotoImporter from "./PhotoImporter";
import OcrReviewGrid from "./OcrReviewGrid";

interface Props {
  onStart: (round: Round) => void;
}

function makeEmptyHoles(): Hole[] {
  return Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    yards: "",
    par: "",
    fir: "",
    gir: "",
    putts: "",
    score: "",
    upDown: "",
    sandSave: "",
  }));
}

export default function CourseSetup({ onStart }: Props) {
  const [courseName, setCourseName] = React.useState("");
  const [teeName, setTeeName] = React.useState("");
  const [teeDistance, setTeeDistance] = React.useState<number | "">("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [playerName, setPlayerName] = React.useState("");
  const [saveAsPreset, setSaveAsPreset] = React.useState(false);
  const [holes, setHoles] = React.useState<Hole[]>(makeEmptyHoles());
  const [showPresets, setShowPresets] = React.useState(false);
  const [showPhoto, setShowPhoto] = React.useState(false);
  const [ocrResult, setOcrResult] = React.useState<{ yards: (number | "")[]; pars: (number | "")[]; confidence: number[] } | null>(null);
  const [error, setError] = React.useState("");

  function loadPreset(preset: CoursePreset) {
    setCourseName(preset.courseName);
    setTeeName(preset.teeName);
    setTeeDistance(preset.teeDistance);
    const next = makeEmptyHoles();
    preset.holes.forEach((ph, i) => {
      if (i < 18) {
        next[i].yards = ph.yards;
        next[i].par = ph.par;
      }
    });
    setHoles(next);
    setShowPresets(false);
  }

  function handleOcrComplete(result: { yards: (number | "")[]; pars: (number | "")[]; confidence: number[] }) {
    setShowPhoto(false);
    setOcrResult(result);
  }

  function applyOcr(yards: (number | "")[], pars: (number | "")[]) {
    const next = holes.map((h, i) => ({
      ...h,
      yards: yards[i] ?? h.yards,
      par: pars[i] ?? h.par,
    }));
    setHoles(next);
    setOcrResult(null);
  }

  function updateHoleYards(i: number, val: string) {
    const n = parseInt(val, 10);
    const next = [...holes];
    next[i] = { ...next[i], yards: isNaN(n) ? "" : n };
    setHoles(next);
  }

  function updateHolePar(i: number, val: string) {
    const n = parseInt(val, 10);
    const next = [...holes];
    next[i] = { ...next[i], par: isNaN(n) ? "" : n };
    setHoles(next);
  }

  function handleStart() {
    if (!courseName.trim()) {
      setError("Course name is required");
      return;
    }
    setError("");
    const round: Round = {
      id: Date.now().toString(),
      courseName: courseName.trim(),
      teeName: teeName.trim(),
      teeDistance,
      date,
      playerName: playerName.trim() || undefined,
      holes,
    };

    if (saveAsPreset) {
      const preset: CoursePreset = {
        id: Date.now().toString(),
        courseName: courseName.trim(),
        teeName: teeName.trim(),
        teeDistance,
        holes: holes.map(h => ({ number: h.number, yards: h.yards, par: h.par })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePreset(preset);
    }

    onStart(round);
  }

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div className="section-header">
        <span>New Round Setup</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => setShowPresets(true)}>Load Preset</button>
          <button className="ghost-btn" onClick={() => setShowPhoto(true)}>Photo Import</button>
        </div>
      </div>

      {/* Course Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input className="form-input" value={courseName} onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Pebble Beach" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tee</label>
              <input className="form-input" value={teeName} onChange={e => setTeeName(e.target.value)}
                placeholder="e.g. Blue" />
            </div>
            <div className="form-group">
              <label className="form-label">Distance (yds)</label>
              <input className="form-input" type="number" value={teeDistance === "" ? "" : teeDistance}
                onChange={e => setTeeDistance(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                placeholder="e.g. 6800" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Player Name</label>
              <input className="form-input" value={playerName} onChange={e => setPlayerName(e.target.value)}
                placeholder="Optional" />
            </div>
          </div>
        </div>
      </div>

      {/* Hole grid */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Hole Information</div>
        <div className="card-body" style={{ overflowX: "auto" }}>
          {["Front 9 (1–9)", "Back 9 (10–18)"].map((label, sectionIdx) => (
            <div key={sectionIdx} style={{ marginBottom: 16 }}>
              <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{label}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ color: "var(--sec)", padding: "4px 6px", textAlign: "center" }}>HOLE</th>
                    <th style={{ color: "var(--sec)", padding: "4px 6px", textAlign: "center" }}>YDS</th>
                    <th style={{ color: "var(--sec)", padding: "4px 6px", textAlign: "center" }}>PAR</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 9 }, (_, i) => {
                    const idx = sectionIdx * 9 + i;
                    return (
                      <tr key={idx}>
                        <td style={{ color: "var(--sec)", textAlign: "center", padding: "4px 6px" }}>{idx + 1}</td>
                        <td style={{ padding: "4px 6px" }}>
                          <input type="number" value={holes[idx].yards === "" ? "" : holes[idx].yards}
                            onChange={e => updateHoleYards(idx, e.target.value)}
                            style={{
                              width: "100%", background: "var(--surface2)", border: "1px solid var(--grid)",
                              borderRadius: 4, padding: "5px 8px", color: "var(--white)", fontSize: 13, textAlign: "center"
                            }} />
                        </td>
                        <td style={{ padding: "4px 6px" }}>
                          <input type="number" min={3} max={5} value={holes[idx].par === "" ? "" : holes[idx].par}
                            onChange={e => updateHolePar(idx, e.target.value)}
                            style={{
                              width: "100%", background: "var(--surface2)", border: "1px solid var(--grid)",
                              borderRadius: 4, padding: "5px 8px", color: "var(--white)", fontSize: 13, textAlign: "center"
                            }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <input type="checkbox" id="savePreset" checked={saveAsPreset} onChange={e => setSaveAsPreset(e.target.checked)} />
        <label htmlFor="savePreset" style={{ color: "var(--sec)", fontSize: 14 }}>Save as preset for future rounds</label>
      </div>

      {error && <div style={{ color: "#ff4444", marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <button className="cta-btn" style={{ width: "100%" }} onClick={handleStart}>
        Start Round →
      </button>

      {showPresets && <SavedPresets onLoad={loadPreset} onClose={() => setShowPresets(false)} />}
      {showPhoto && <PhotoImporter onOcrComplete={handleOcrComplete} onClose={() => setShowPhoto(false)} />}
      {ocrResult && (
        <OcrReviewGrid
          yards={ocrResult.yards}
          pars={ocrResult.pars}
          confidence={ocrResult.confidence}
          onApply={applyOcr}
          onCancel={() => setOcrResult(null)}
        />
      )}
    </div>
  );
}
