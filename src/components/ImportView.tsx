import React from "react";
import type { Round, Hole } from "../types";

interface Props {
  onImportComplete: (round: Round) => void;
  onClose: () => void;
}

type ImportStep = "choose" | "manual" | "review";

interface BirdiesField {
  key: string;
  label: string;
  hint: string;
  type: "text" | "number" | "date";
}

const BIRDIES_FIELDS: BirdiesField[] = [
  { key: "courseName", label: "Course Name", hint: "From 18Birdies round header", type: "text" },
  { key: "teeName", label: "Tee Name", hint: "e.g. White, Blue, Championship", type: "text" },
  { key: "date", label: "Date Played", hint: "YYYY-MM-DD format", type: "date" },
  { key: "playerName", label: "Player Name", hint: "Your name as shown in 18Birdies", type: "text" },
];

interface HoleImport {
  number: number;
  par: string;
  score: string;
  putts: string;
  fir: string;
  gir: string;
}

function makeEmptyHoleImports(): HoleImport[] {
  return Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: "",
    score: "",
    putts: "",
    fir: "",
    gir: "",
  }));
}

function convertToRound(
  meta: Record<string, string>,
  holeImports: HoleImport[]
): Round {
  const holes: Hole[] = holeImports.map(h => ({
    number: h.number,
    yards: "",
    par: h.par !== "" ? parseInt(h.par) || "" : "",
    fir: h.fir === "y" ? "hit" : h.fir === "n" ? "miss" : "",
    gir: h.gir === "y" ? "hit" : h.gir === "n" ? "miss" : "",
    putts: h.putts !== "" ? parseInt(h.putts) || "" : "",
    score: h.score !== "" ? parseInt(h.score) || "" : "",
    upDown: "",
    sandSave: "",
  }));

  return {
    id: `imported-${Date.now()}`,
    courseName: meta.courseName || "Imported Round",
    teeName: meta.teeName || "",
    teeDistance: "",
    date: meta.date || new Date().toISOString().slice(0, 10),
    playerName: meta.playerName || undefined,
    holes,
  };
}

export default function ImportView({ onImportComplete, onClose }: Props) {
  const [step, setStep] = React.useState<ImportStep>("choose");
  const [meta, setMeta] = React.useState<Record<string, string>>({
    courseName: "",
    teeName: "",
    date: new Date().toISOString().slice(0, 10),
    playerName: "",
  });
  const [holes, setHoles] = React.useState<HoleImport[]>(makeEmptyHoleImports());
  const [reviewRound, setReviewRound] = React.useState<Round | null>(null);
  const [importNote, setImportNote] = React.useState("");

  function handleMetaChange(key: string, value: string) {
    setMeta(prev => ({ ...prev, [key]: value }));
  }

  function handleHoleChange(idx: number, field: keyof HoleImport, value: string) {
    setHoles(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function buildReview() {
    const round = convertToRound(meta, holes);
    setReviewRound(round);
    setStep("review");
  }

  function confirmImport() {
    if (!reviewRound) return;
    onImportComplete(reviewRound);
    onClose();
  }

  // --- Step: Choose --------------------------------------------------------
  if (step === "choose") {
    return (
      <div style={{ padding: "24px 16px", maxWidth: 520, margin: "0 auto" }}>
        <div className="screen-header" style={{ margin: "-24px -16px 24px", width: "calc(100% + 32px)" }}>
          <button className="back-btn" onClick={onClose}>
            <span className="back-btn-chevron">‹</span>
            <span>Back</span>
          </button>
          <span className="screen-header-title">Import from 18Birdies</span>
          <div className="screen-header-action" />
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--white)", marginBottom: 6 }}>Manual Entry</div>
            <div style={{ color: "var(--sec)", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
              Enter your round details from 18Birdies manually. Use the scorecard from your 18Birdies history or a screenshot.
            </div>
            <button className="cta-btn" style={{ width: "100%" }} onClick={() => setStep("manual")}>
              Start Manual Entry
            </button>
          </div>
        </div>

        <div className="card" style={{ opacity: 0.6 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--white)", marginBottom: 6 }}>
              Photo Import
              <span style={{ fontSize: 11, color: "var(--orange)", marginLeft: 8, fontWeight: 600 }}>COMING SOON</span>
            </div>
            <div style={{ color: "var(--sec)", fontSize: 13, lineHeight: 1.5 }}>
              Take a screenshot of your 18Birdies scorecard and we will OCR it automatically.
            </div>
          </div>
        </div>

        <div style={{ color: "var(--sec)", fontSize: 12, marginTop: 16, lineHeight: 1.6, textAlign: "center" }}>
          18Birdies rounds will be imported with an "imported" flag and stored in your scorecard history.
        </div>
      </div>
    );
  }

  // --- Step: Manual Entry --------------------------------------------------
  if (step === "manual") {
    return (
      <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setStep("choose")}
            style={{ background: "none", border: "none", color: "var(--sec)", cursor: "pointer", fontSize: 22, padding: 4, lineHeight: 1 }}
          >
            &#8592;
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)" }}>Round Details</div>
            <div style={{ color: "var(--sec)", fontSize: 13 }}>Enter info from your 18Birdies app</div>
          </div>
        </div>

        {/* Meta fields */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BIRDIES_FIELDS.map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input"
                  type={f.type}
                  placeholder={f.hint}
                  value={meta[f.key] || ""}
                  onChange={e => handleMetaChange(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hole-by-hole entry */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--white)", marginBottom: 12 }}>Hole Scores</div>

            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 56px 56px",
              gap: 6, marginBottom: 8,
            }}>
              {["#", "Par", "Score", "Putts", "FIR", "GIR"].map(h => (
                <div key={h} style={{ fontSize: 11, color: "var(--sec)", fontWeight: 600, textAlign: "center" }}>{h}</div>
              ))}
            </div>

            {holes.map((h, i) => (
              <div
                key={h.number}
                style={{
                  display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 56px 56px",
                  gap: 6, marginBottom: 6, alignItems: "center",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", fontWeight: 600 }}>{h.number}</div>
                <input
                  className="form-input"
                  type="number" min="3" max="5"
                  style={{ padding: "8px 6px", fontSize: 14, textAlign: "center" }}
                  placeholder="4"
                  value={h.par}
                  onChange={e => handleHoleChange(i, "par", e.target.value)}
                />
                <input
                  className="form-input"
                  type="number" min="1" max="20"
                  style={{ padding: "8px 6px", fontSize: 14, textAlign: "center" }}
                  placeholder="-"
                  value={h.score}
                  onChange={e => handleHoleChange(i, "score", e.target.value)}
                />
                <input
                  className="form-input"
                  type="number" min="0" max="10"
                  style={{ padding: "8px 6px", fontSize: 14, textAlign: "center" }}
                  placeholder="-"
                  value={h.putts}
                  onChange={e => handleHoleChange(i, "putts", e.target.value)}
                />
                {/* FIR toggle */}
                <select
                  className="form-input"
                  style={{ padding: "8px 4px", fontSize: 12, textAlign: "center" }}
                  value={h.fir}
                  onChange={e => handleHoleChange(i, "fir", e.target.value)}
                >
                  <option value="">-</option>
                  <option value="y">Y</option>
                  <option value="n">N</option>
                </select>
                {/* GIR toggle */}
                <select
                  className="form-input"
                  style={{ padding: "8px 4px", fontSize: 12, textAlign: "center" }}
                  value={h.gir}
                  onChange={e => handleHoleChange(i, "gir", e.target.value)}
                >
                  <option value="">-</option>
                  <option value="y">Y</option>
                  <option value="n">N</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Import Notes (optional)</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Any notes about this round..."
            value={importNote}
            onChange={e => setImportNote(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <button
          className="cta-btn"
          style={{ width: "100%", marginBottom: 10 }}
          onClick={buildReview}
        >
          Review Import
        </button>
        <button className="ghost-btn" style={{ width: "100%" }} onClick={onClose}>Cancel</button>
      </div>
    );
  }

  // --- Step: Review --------------------------------------------------------
  if (step === "review" && reviewRound) {
    const totalScore = reviewRound.holes.reduce((sum, h) => sum + (typeof h.score === "number" ? h.score : 0), 0);
    const totalPar = reviewRound.holes.reduce((sum, h) => sum + (typeof h.par === "number" ? h.par : 0), 0);
    const scoreToPar = totalScore - totalPar;
    const firsHit = reviewRound.holes.filter(h => h.fir === "hit").length;
    const girsHit = reviewRound.holes.filter(h => h.gir === "hit").length;
    const totalPutts = reviewRound.holes.reduce((sum, h) => sum + (typeof h.putts === "number" ? h.putts : 0), 0);

    return (
      <div style={{ padding: "24px 16px", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setStep("manual")}
            style={{ background: "none", border: "none", color: "var(--sec)", cursor: "pointer", fontSize: 22, padding: 4, lineHeight: 1 }}
          >
            &#8592;
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)" }}>Review Import</div>
            <div style={{ color: "var(--sec)", fontSize: 13 }}>Confirm before saving</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--orange)", marginBottom: 4 }}>{reviewRound.courseName}</div>
            <div style={{ color: "var(--sec)", fontSize: 13, marginBottom: 12 }}>
              {reviewRound.teeName && <span>{reviewRound.teeName} tees  -  </span>}
              {reviewRound.date}
              {reviewRound.playerName && <span>  -  {reviewRound.playerName}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Score", value: totalScore > 0 ? (scoreToPar >= 0 ? `+${scoreToPar}` : `${scoreToPar}`) : "-" },
                { label: "Gross", value: totalScore > 0 ? totalScore : "-" },
                { label: "FIR", value: `${firsHit}/14` },
                { label: "GIR", value: `${girsHit}/18` },
                { label: "Putts", value: totalPutts > 0 ? totalPutts : "-" },
                { label: "Source", value: "18Birdies" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--sec)", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginTop: 2 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ color: "var(--sec)", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
          This round will be saved to your scorecard history and flagged as an imported round.
          You can edit any hole details after import.
        </div>

        <button className="cta-btn" style={{ width: "100%", marginBottom: 10 }} onClick={confirmImport}>
          Save to Pin High
        </button>
        <button className="ghost-btn" style={{ width: "100%" }} onClick={() => setStep("manual")}>
          Back and Edit
        </button>
      </div>
    );
  }

  return null;
}
