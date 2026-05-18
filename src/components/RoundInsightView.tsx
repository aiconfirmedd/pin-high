import type { Round, Club } from "../types";
import { analyzeRound } from "../utils/scorecardAnalytics";
import ExportControls from "./ExportControls";

interface Props {
  round: Round;
  clubs: Club[];
  onReflect: () => void;
  onBack: () => void;
}

function StatBar({ pct, label, detail }: { pct: number; label: string; detail: string }) {
  return (
    <div className="stat-bar-item">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "var(--sec)", fontSize: 13 }}>{label}</span>
        <span style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{detail}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

export default function RoundInsightView({ round, clubs, onReflect, onBack }: Props) {
  const analysis = analyzeRound(round.holes);

  const inconsistentClubs = clubs.filter(c => c.status === "inconsistent" || c.status === "needs-distance");

  const toParStr = analysis.toPar === 0 ? "E" : analysis.toPar > 0 ? `+${analysis.toPar}` : `${analysis.toPar}`;
  const front9ToParStr = analysis.front9.par > 0
    ? (analysis.front9.score - analysis.front9.par > 0
      ? `+${analysis.front9.score - analysis.front9.par}`
      : analysis.front9.score - analysis.front9.par === 0 ? "E" : `${analysis.front9.score - analysis.front9.par}`)
    : "—";
  const back9ToParStr = analysis.back9.par > 0
    ? (analysis.back9.score - analysis.back9.par > 0
      ? `+${analysis.back9.score - analysis.back9.par}`
      : analysis.back9.score - analysis.back9.par === 0 ? "E" : `${analysis.back9.score - analysis.back9.par}`)
    : "—";

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Topbar */}
      <div className="topbar">
        <button className="icon-btn" onClick={onBack}>← Back</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "var(--white)", fontWeight: 700, fontSize: 16 }}>Round Insight</div>
          <div style={{ color: "var(--sec)", fontSize: 12 }}>{round.courseName}</div>
        </div>
        <ExportControls targetId="insight-export" filename="round-insight.pdf" />
      </div>

      <div id="insight-export" style={{ padding: 16 }}>
        {/* 1. Round Summary */}
        <div className="insight-card">
          <div className="card-header">Round Summary</div>
          <div className="card-body">
            <div className="big-score-row">
              <div className="big-stat">
                <div style={{ fontSize: 48, fontWeight: 900, color: "var(--white)", lineHeight: 1 }}>
                  {analysis.totalScore || "—"}
                </div>
                <div style={{ color: "var(--sec)", fontSize: 13 }}>Gross Score</div>
              </div>
              <div className="big-stat">
                <div style={{
                  fontSize: 48, fontWeight: 900, lineHeight: 1,
                  color: analysis.toPar < 0 ? "var(--orange-lt)" : analysis.toPar > 0 ? "#ff6b6b" : "var(--white)"
                }}>
                  {analysis.totalScore ? toParStr : "—"}
                </div>
                <div style={{ color: "var(--sec)", fontSize: 13 }}>To Par</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--white)" }}>{analysis.front9.score || "—"}</div>
                <div style={{ color: "var(--sec)", fontSize: 12 }}>Front ({front9ToParStr})</div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--white)" }}>{analysis.back9.score || "—"}</div>
                <div style={{ color: "var(--sec)", fontSize: 12 }}>Back ({back9ToParStr})</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              {[
                { label: "Eagles+", val: analysis.eagles + analysis.albatrosses, color: "var(--orange-lt)" },
                { label: "Birdies", val: analysis.birdies, color: "var(--orange-lt)" },
                { label: "Pars", val: analysis.pars, color: "var(--white)" },
                { label: "Bogeys", val: analysis.bogeys, color: "#ff9966" },
                { label: "Doubles+", val: analysis.doubles + analysis.tripleOrWorse, color: "#ff4444" },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ color: "var(--sec)", fontSize: 11 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Stat Percentages */}
        <div className="insight-card">
          <div className="card-header">Performance Stats</div>
          <div className="card-body">
            <StatBar
              pct={analysis.firPct}
              label="Fairways in Regulation"
              detail={`${Math.round(analysis.firPct)}% (${analysis.firHit}/${analysis.firAtt})`}
            />
            <StatBar
              pct={analysis.girPct}
              label="Greens in Regulation"
              detail={`${Math.round(analysis.girPct)}% (${analysis.girHit}/${analysis.girAtt})`}
            />
            <StatBar
              pct={analysis.avgPutts > 0 ? ((3 - analysis.avgPutts) / 3) * 100 : 0}
              label="Avg Putts per Hole"
              detail={analysis.avgPutts > 0 ? analysis.avgPutts.toFixed(1) : "—"}
            />
            <StatBar
              pct={analysis.udPct}
              label="Up & Down"
              detail={`${Math.round(analysis.udPct)}% (${analysis.udMade}/${analysis.udAtt})`}
            />
            <StatBar
              pct={analysis.ssPct}
              label="Sand Saves"
              detail={`${Math.round(analysis.ssPct)}% (${analysis.ssMade}/${analysis.ssAtt})`}
            />
          </div>
        </div>

        {/* 3. Where Strokes Were Lost */}
        {analysis.strokeLoss.length > 0 && (
          <div className="insight-card">
            <div className="card-header">Where Strokes Were Lost</div>
            <div className="card-body">
              {analysis.strokeLoss.map((item, i) => (
                <div key={item.label} className="stroke-item">
                  <span style={{ color: "var(--sec)", fontSize: 14, flex: 1 }}>
                    {i + 1}. {item.label}
                  </span>
                  <span style={{
                    color: item.strokes > 3 ? "#ff4444" : item.strokes > 1 ? "#ff9966" : "var(--sec)",
                    fontWeight: 700, fontSize: 15, minWidth: 40, textAlign: "right"
                  }}>
                    {item.strokes > 0 ? `+${item.strokes}` : item.strokes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Priority Work List */}
        {analysis.priorityList.length > 0 && (
          <div className="insight-card">
            <div className="card-header">Priority Work List</div>
            <div className="card-body">
              {analysis.priorityList.map((item, i) => (
                <div key={i} className="priority-item">
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--orange)", color: "var(--white)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ color: "var(--white)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Club Pattern Review */}
        {inconsistentClubs.length > 0 && (
          <div className="insight-card">
            <div className="card-header">Club Notes</div>
            <div className="card-body">
              {inconsistentClubs.map(c => (
                <div key={c.id} style={{ marginBottom: 10, padding: "10px 12px", background: "var(--surface2)", borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 14 }}>{c.name}</div>
                  <div style={{ color: "var(--sec)", fontSize: 13 }}>
                    Status: <span style={{ color: c.status === "needs-distance" ? "#ff6b6b" : "#FF9340" }}>
                      {c.status === "needs-distance" ? "Needs distance work" : "Inconsistent"}
                    </span>
                    {c.mainMiss && ` · Miss: ${c.mainMiss}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ padding: "0 16px 24px" }}>
        <button className="cta-btn" style={{ width: "100%" }} onClick={onReflect}>
          Post-Round Reflection →
        </button>
      </div>
    </div>
  );
}
