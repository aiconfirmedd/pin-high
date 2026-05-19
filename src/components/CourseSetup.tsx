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
  const [setupMode, setSetupMode] = React.useState<"start" | "previous" | "dashboard">("start");
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
  const [editingHoleIdx, setEditingHoleIdx] = React.useState<number | null>(null);
  const [draftYards, setDraftYards] = React.useState<number | "">("");
  const [draftPar, setDraftPar] = React.useState<number | "">("");
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

  function openHoleEditor(idx: number) {
    setEditingHoleIdx(idx);
    setDraftYards(holes[idx].yards);
    setDraftPar(holes[idx].par);
  }

  function applyHoleEditor() {
    if (editingHoleIdx === null) return;
    const next = [...holes];
    next[editingHoleIdx] = {
      ...next[editingHoleIdx],
      yards: draftYards,
      par: draftPar,
    };
    setHoles(next);
    setEditingHoleIdx(null);
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
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-logo-card">
          <img src="/pin-high-logo.jpg" alt="Pin High" className="home-logo-img" />
        </div>
        <div className="home-hero-copy">
          <div className="home-kicker">Mobile Round Command</div>
          <h1>Pin High</h1>
          <p>Build the round once, then score fast from the first tee to the final putt.</p>
        </div>
      </section>

      <div className="mode-switch" aria-label="Round actions">
        {[
          { id: "start", label: "Start Round" },
          { id: "previous", label: "Enter Previous" },
          { id: "dashboard", label: "Dashboard" },
        ].map(item => (
          <button
            key={item.id}
            className={`mode-pill ${setupMode === item.id ? "mode-pill-active" : ""}`}
            onClick={() => setSetupMode(item.id as "start" | "previous" | "dashboard")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="action-rail" aria-label="Round setup shortcuts">
        <button className="action-card" onClick={() => setShowPresets(true)}>
          <span className="action-icon">▣</span>
          <span>
            <strong>Load Preset</strong>
            <small>Start from a saved course</small>
          </span>
        </button>
        <button className="action-card" onClick={() => setShowPhoto(true)}>
          <span className="action-icon">◎</span>
          <span>
            <strong>Photo Import</strong>
            <small>Read yards and par from a card</small>
          </span>
        </button>
      </div>

      {/* Course Info */}
      <div className="section-header">
        {setupMode === "previous" ? "Enter Previous Round" : setupMode === "dashboard" ? "My Dashboard" : "Start Round"}
      </div>

      {setupMode === "dashboard" && (
        <div className="dashboard-preview">
          <div>
            <span>Rounds</span>
            <strong>Ready</strong>
          </div>
          <div>
            <span>Next Step</span>
            <strong>Start scoring</strong>
          </div>
          <div>
            <span>Tools</span>
            <strong>Import or manual</strong>
          </div>
        </div>
      )}

      <div className="card showcase-card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input className="form-input" value={courseName} onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Pebble Beach" />
          </div>
          <div className="setup-grid setup-grid-two">
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
          <div className="setup-grid setup-grid-two">
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
      <div className="card showcase-card" style={{ marginBottom: 16 }}>
        <div className="card-header">Hole Information</div>
        <div className="card-body">
          {["Front 9 (1–9)", "Back 9 (10–18)"].map((label, sectionIdx) => (
            <div key={sectionIdx} className="hole-panel">
              <div className="hole-panel-title">{label}</div>
              <div className="hole-entry-head">
                <span>Hole</span>
                <span>Yards</span>
                <span>Par</span>
              </div>
              {Array.from({ length: 9 }, (_, i) => {
                const idx = sectionIdx * 9 + i;
                return (
                  <button key={idx} className="hole-entry-row" onClick={() => openHoleEditor(idx)}>
                    <span className="hole-number">{idx + 1}</span>
                    <span className="hole-value">{holes[idx].yards === "" ? "Set yards" : `${holes[idx].yards} yds`}</span>
                    <span className="hole-par">{holes[idx].par === "" ? "Set par" : `Par ${holes[idx].par}`}</span>
                  </button>
                );
              })}
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
      {editingHoleIdx !== null && (
        <div className="sheet-overlay" onClick={() => setEditingHoleIdx(null)}>
          <div className="hole-editor-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="hole-editor-title">Hole {editingHoleIdx + 1}</div>
            <label className="picker-label">Yards</label>
            <div className="yard-picker">
              <select
                size={5}
                value={draftYards === "" ? "" : String(draftYards)}
                onChange={e => setDraftYards(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              >
                <option value="">No yards</option>
                {Array.from({ length: 551 }, (_, i) => i + 50).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <input
                type="number"
                inputMode="numeric"
                value={draftYards === "" ? "" : draftYards}
                onChange={e => setDraftYards(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                placeholder="Type yards"
              />
            </div>

            <div className="par-picker-title">Par</div>
            <div className="par-picker">
              {[3, 4, 5].map(par => (
                <button
                  key={par}
                  className={`par-box ${draftPar === par ? "par-box-active" : ""}`}
                  onClick={() => setDraftPar(par)}
                >
                  {par}
                </button>
              ))}
            </div>
            <input
              className="par-type-input"
              type="number"
              inputMode="numeric"
              min={3}
              max={5}
              value={draftPar === "" ? "" : draftPar}
              onChange={e => setDraftPar(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              placeholder="Or type par"
            />

            <div className="sheet-actions">
              <button className="ghost-btn" onClick={() => setEditingHoleIdx(null)}>Cancel</button>
              <button className="cta-btn" onClick={applyHoleEditor}>Save Hole</button>
            </div>
          </div>
        </div>
      )}
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
