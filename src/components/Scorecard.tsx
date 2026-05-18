import React from "react";
import type { Round, Hole } from "../types";
import { calcTotals, formatPct, scoreToPar } from "../utils/scorecardMath";
import ScorecardSection from "./ScorecardSection";
import ExportControls from "./ExportControls";

interface Props {
  round: Round;
  onRoundChange: (r: Round) => void;
  onViewInsight: () => void;
  onHoleClick: (i: number) => void;
}

export default function Scorecard({ round, onRoundChange, onViewInsight, onHoleClick }: Props) {
  const [tab, setTab] = React.useState<"scorecard" | "stats">("scorecard");

  const front9 = round.holes.slice(0, 9);
  const back9 = round.holes.slice(9, 18);
  const allTotals = calcTotals(round.holes);
  const frontTotals = calcTotals(front9);
  const backTotals = calcTotals(back9);

  const filledScores = round.holes.filter(h => h.score !== "").length;
  const showInsight = filledScores >= 9;

  function updateHole(idx: number, field: keyof Hole, value: unknown) {
    const next = round.holes.map((h, i) => i === idx ? { ...h, [field]: value } : h);
    onRoundChange({ ...round, holes: next });
  }

  const toPar = round.holes.reduce((sum, h) => {
    if (h.score !== "" && h.par !== "") return sum + (h.score - h.par);
    return sum;
  }, 0);

  const birdiesCount = round.holes.filter(h => {
    const d = scoreToPar(h.score, h.par);
    return d !== null && d <= -1;
  }).length;

  const toParStr = toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : `${toPar}`;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="topbar-course">{round.courseName || "Course"}</div>
          <div className="topbar-meta">
            {round.teeName && <span>{round.teeName}</span>}
            {round.teeDistance !== "" && <span> · {round.teeDistance} yds</span>}
            {round.date && <span> · {round.date}</span>}
          </div>
        </div>
        <div className="topbar-right">
          <ExportControls targetId="scorecard-export" filename="scorecard.pdf" />
          {showInsight && (
            <button className="icon-btn-primary" onClick={onViewInsight}>Insight</button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="summary-strip" id="scorecard-export">
        <div className="stat-block">
          <div className="stat-val">{allTotals.score || "—"}</div>
          <div className="stat-label">Score</div>
        </div>
        <div className="stat-block">
          <div className={`stat-val ${toPar < 0 ? "stat-val-pos" : toPar > 0 ? "stat-val-neg" : ""}`}>
            {allTotals.score ? toParStr : "—"}
          </div>
          <div className="stat-label">To Par</div>
        </div>
        <div className="stat-block">
          <div className="stat-val">{formatPct(allTotals.firHit, allTotals.firAtt)}</div>
          <div className="stat-label">FIR</div>
        </div>
        <div className="stat-block">
          <div className="stat-val">{formatPct(allTotals.girHit, allTotals.girAtt)}</div>
          <div className="stat-label">GIR</div>
        </div>
        <div className="stat-block">
          <div className="stat-val">{allTotals.putts > 0 ? (allTotals.putts / Math.max(1, round.holes.filter(h => h.putts !== "").length)).toFixed(1) : "—"}</div>
          <div className="stat-label">Avg Putts</div>
        </div>
        <div className="stat-block">
          <div className="stat-val stat-val-pos">{birdiesCount}</div>
          <div className="stat-label">Birdies+</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "scorecard" ? "tab-active" : ""}`} onClick={() => setTab("scorecard")}>Scorecard</button>
        <button className={`tab ${tab === "stats" ? "tab-active" : ""}`} onClick={() => setTab("stats")}>Stats</button>
      </div>

      {tab === "scorecard" && (
        <div>
          <ScorecardSection
            holes={front9}
            startHole={0}
            label="OUT"
            onHoleClick={onHoleClick}
            onCellChange={updateHole}
          />
          <ScorecardSection
            holes={back9}
            startHole={9}
            label="IN"
            onHoleClick={onHoleClick}
            onCellChange={updateHole}
          />

          {/* TOTAL row */}
          <div className="scorecard-wrap">
            <table className="scorecard-table">
              <tbody>
                <tr className="total-row">
                  <td className="hole-num-cell">TOTAL</td>
                  <td className="yards-cell">{allTotals.yards}</td>
                  <td className="par-cell">{allTotals.par}</td>
                  <td className="stat-cell">{formatPct(allTotals.firHit, allTotals.firAtt)}</td>
                  <td className="stat-cell">{formatPct(allTotals.girHit, allTotals.girAtt)}</td>
                  <td className="stat-cell">{allTotals.putts || "—"}</td>
                  <td className="score-cell" style={{ fontWeight: 700, fontSize: 16 }}>
                    {allTotals.score || "—"}
                  </td>
                  <td className="stat-cell" style={{ fontWeight: 700 }}>
                    {allTotals.score && allTotals.par
                      ? toParStr
                      : "—"}
                  </td>
                  <td className="stat-cell">{formatPct(allTotals.udMade, allTotals.udAtt)}</td>
                  <td className="stat-cell">{formatPct(allTotals.ssMade, allTotals.ssAtt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div style={{ padding: 16 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">Stat Summary</div>
            <div className="card-body">
              {[
                { label: "Fairways in Regulation", hit: allTotals.firHit, att: allTotals.firAtt },
                { label: "Greens in Regulation", hit: allTotals.girHit, att: allTotals.girAtt },
                { label: "Up & Down", hit: allTotals.udMade, att: allTotals.udAtt },
                { label: "Sand Saves", hit: allTotals.ssMade, att: allTotals.ssAtt },
              ].map(s => (
                <div key={s.label} className="stat-bar-item">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--sec)", fontSize: 13 }}>{s.label}</span>
                    <span style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>
                      {formatPct(s.hit, s.att)} ({s.hit}/{s.att})
                    </span>
                  </div>
                  <div className="stat-bar-track">
                    <div className="stat-bar-fill" style={{ width: s.att > 0 ? `${(s.hit / s.att) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Scoring Distribution</div>
            <div className="card-body">
              {[
                { label: "Eagles or better", cls: "sym-eagle", count: round.holes.filter(h => { const d = scoreToPar(h.score, h.par); return d !== null && d <= -2; }).length },
                { label: "Birdies", cls: "sym-birdie", count: round.holes.filter(h => scoreToPar(h.score, h.par) === -1).length },
                { label: "Pars", cls: "sym-par", count: round.holes.filter(h => scoreToPar(h.score, h.par) === 0).length },
                { label: "Bogeys", cls: "sym-bogey", count: round.holes.filter(h => scoreToPar(h.score, h.par) === 1).length },
                { label: "Double Bogeys", cls: "sym-double", count: round.holes.filter(h => scoreToPar(h.score, h.par) === 2).length },
                { label: "Triple+", cls: "sym-triple", count: round.holes.filter(h => { const d = scoreToPar(h.score, h.par); return d !== null && d >= 3; }).length },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span className={item.cls} style={{ minWidth: 28, textAlign: "center" }}>{item.count}</span>
                  <span style={{ color: "var(--sec)", fontSize: 14 }}>{item.label}</span>
                  <div style={{ flex: 1, display: "flex", gap: 4 }}>
                    {Array.from({ length: item.count }, (_, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: "var(--orange)", opacity: 0.7 }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Front/Back split */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">Front / Back Split</div>
            <div className="card-body">
              <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--white)" }}>{frontTotals.score || "—"}</div>
                  <div style={{ color: "var(--sec)", fontSize: 13 }}>Front 9 ({frontTotals.par > 0 ? (frontTotals.score > 0 ? (frontTotals.score - frontTotals.par > 0 ? `+${frontTotals.score - frontTotals.par}` : frontTotals.score - frontTotals.par === 0 ? "E" : frontTotals.score - frontTotals.par) : "—") : "—"})</div>
                </div>
                <div style={{ width: 1, background: "var(--grid)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--white)" }}>{backTotals.score || "—"}</div>
                  <div style={{ color: "var(--sec)", fontSize: 13 }}>Back 9 ({backTotals.par > 0 ? (backTotals.score > 0 ? (backTotals.score - backTotals.par > 0 ? `+${backTotals.score - backTotals.par}` : backTotals.score - backTotals.par === 0 ? "E" : backTotals.score - backTotals.par) : "—") : "—"})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
