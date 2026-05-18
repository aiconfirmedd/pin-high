import React from "react";
import type { Hole, HoleFIR, HoleGIR, HoleUD, HoleSS } from "../types";
import { scoreToPar, getScoringSymbolClass, calcTotals, formatPct } from "../utils/scorecardMath";

interface Props {
  holes: Hole[];
  startHole: number;
  label: "OUT" | "IN";
  onHoleClick: (holeIndex: number) => void;
  onCellChange: (holeIndex: number, field: keyof Hole, value: unknown) => void;
}

function cycleFIR(cur: HoleFIR): HoleFIR {
  if (cur === "" || cur === "na") return "hit";
  if (cur === "hit") return "miss";
  return "na";
}

function cycleGIR(cur: HoleGIR): HoleGIR {
  if (cur === "") return "hit";
  if (cur === "hit") return "miss";
  return "";
}

function cycleUD(cur: HoleUD): HoleUD {
  if (cur === "" || cur === "dash") return "made";
  if (cur === "made") return "missed";
  return "dash";
}

function cycleSS(cur: HoleSS): HoleSS {
  if (cur === "" || cur === "dash") return "made";
  if (cur === "made") return "missed";
  return "dash";
}

function firDisplay(fir: HoleFIR, isPar3: boolean): React.ReactNode {
  if (isPar3) return <span style={{ color: "var(--muted)" }}>—</span>;
  if (fir === "hit") return <span className="stat-hit">✓</span>;
  if (fir === "miss") return <span className="stat-miss">✕</span>;
  if (fir === "na") return <span style={{ color: "var(--muted)" }}>N/A</span>;
  return <span style={{ color: "var(--muted)" }}>·</span>;
}

function girDisplay(gir: HoleGIR): React.ReactNode {
  if (gir === "hit") return <span className="stat-hit">✓</span>;
  if (gir === "miss") return <span className="stat-miss">✕</span>;
  return <span style={{ color: "var(--muted)" }}>·</span>;
}

function udDisplay(ud: HoleUD): React.ReactNode {
  if (ud === "made") return <span className="stat-hit">✓</span>;
  if (ud === "missed") return <span className="stat-miss">✕</span>;
  if (ud === "dash") return <span style={{ color: "var(--muted)" }}>—</span>;
  return <span style={{ color: "var(--muted)" }}>·</span>;
}

function ssDisplay(ss: HoleSS): React.ReactNode {
  if (ss === "made") return <span className="stat-hit">✓</span>;
  if (ss === "missed") return <span className="stat-miss">✕</span>;
  if (ss === "dash") return <span style={{ color: "var(--muted)" }}>—</span>;
  return <span style={{ color: "var(--muted)" }}>·</span>;
}

export default function ScorecardSection({ holes, startHole, label, onHoleClick, onCellChange }: Props) {
  const totals = calcTotals(holes);

  return (
    <div className="scorecard-wrap">
      <table className="scorecard-table">
        <thead>
          <tr>
            <th className="hole-num-cell">HOLE</th>
            <th className="yards-cell">YDS</th>
            <th className="par-cell">PAR</th>
            <th className="stat-cell">FIR</th>
            <th className="stat-cell">GIR</th>
            <th className="stat-cell">PUTTS</th>
            <th className="score-cell">SCORE</th>
            <th className="stat-cell">+/−</th>
            <th className="stat-cell">U/D</th>
            <th className="stat-cell">S/S</th>
          </tr>
        </thead>
        <tbody>
          {holes.map((hole, i) => {
            const globalIdx = startHole + i;
            const isPar3 = hole.par === 3;
            const diff = scoreToPar(hole.score, hole.par);
            const symClass = getScoringSymbolClass(diff);
            const deltaClass = diff === null ? "" : diff < 0 ? "delta-under" : diff > 0 ? "delta-over" : "delta-even";

            return (
              <tr key={hole.number} onClick={() => onHoleClick(globalIdx)}>
                <td className="hole-num-cell">{hole.number}</td>
                <td className="yards-cell">{hole.yards !== "" ? hole.yards : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td className="par-cell">{hole.par !== "" ? hole.par : <span style={{ color: "var(--muted)" }}>—</span>}</td>

                {/* FIR */}
                <td className="stat-cell" onClick={e => {
                  e.stopPropagation();
                  if (!isPar3) onCellChange(globalIdx, "fir", cycleFIR(hole.fir));
                }}>
                  {firDisplay(hole.fir, isPar3)}
                </td>

                {/* GIR */}
                <td className="stat-cell" onClick={e => {
                  e.stopPropagation();
                  onCellChange(globalIdx, "gir", cycleGIR(hole.gir));
                }}>
                  {girDisplay(hole.gir)}
                </td>

                {/* PUTTS */}
                <td className="stat-cell" onClick={e => e.stopPropagation()}>
                  <input
                    type="number" min={0} max={15}
                    value={hole.putts === "" ? "" : hole.putts}
                    onChange={e => {
                      const v = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                      onCellChange(globalIdx, "putts", v);
                    }}
                    style={{
                      width: 40, background: "transparent", border: "none",
                      color: "var(--white)", textAlign: "center", fontSize: 14, outline: "none"
                    }}
                  />
                </td>

                {/* SCORE */}
                <td className="score-cell" onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className={symClass}>
                      <input
                        type="number" min={1} max={15}
                        value={hole.score === "" ? "" : hole.score}
                        onChange={e => {
                          const v = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                          onCellChange(globalIdx, "score", v);
                        }}
                        style={{
                          width: 38, background: "transparent", border: "none",
                          color: "inherit", textAlign: "center", fontSize: 14, outline: "none"
                        }}
                      />
                    </span>
                  </div>
                </td>

                {/* +/- */}
                <td className={`stat-cell ${deltaClass}`}>
                  {diff === null ? "" : diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff}
                </td>

                {/* U/D */}
                <td className="stat-cell" onClick={e => {
                  e.stopPropagation();
                  onCellChange(globalIdx, "upDown", cycleUD(hole.upDown));
                }}>
                  {udDisplay(hole.upDown)}
                </td>

                {/* S/S */}
                <td className="stat-cell" onClick={e => {
                  e.stopPropagation();
                  onCellChange(globalIdx, "sandSave", cycleSS(hole.sandSave));
                }}>
                  {ssDisplay(hole.sandSave)}
                </td>
              </tr>
            );
          })}

          {/* Subtotal row */}
          <tr className="subtotal-row">
            <td className="hole-num-cell">{label}</td>
            <td className="yards-cell">{totals.yards}</td>
            <td className="par-cell">{totals.par}</td>
            <td className="stat-cell">{formatPct(totals.firHit, totals.firAtt)}</td>
            <td className="stat-cell">{formatPct(totals.girHit, totals.girAtt)}</td>
            <td className="stat-cell">{totals.putts || "—"}</td>
            <td className="score-cell">{totals.score || "—"}</td>
            <td className="stat-cell">
              {totals.par > 0 && totals.score > 0
                ? (totals.score - totals.par > 0 ? `+${totals.score - totals.par}` : totals.score - totals.par === 0 ? "E" : totals.score - totals.par)
                : "—"}
            </td>
            <td className="stat-cell">{formatPct(totals.udMade, totals.udAtt)}</td>
            <td className="stat-cell">{formatPct(totals.ssMade, totals.ssAtt)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
