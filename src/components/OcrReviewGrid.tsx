import React from "react";

interface Props {
  yards: (number | "")[];
  pars: (number | "")[];
  confidence: number[];
  onApply: (yards: (number | "")[], pars: (number | "")[]) => void;
  onCancel: () => void;
}

export default function OcrReviewGrid({ yards: initYards, pars: initPars, confidence, onApply, onCancel }: Props) {
  const [yards, setYards] = React.useState<(number | "")[]>(initYards.slice(0, 18));
  const [pars, setPars] = React.useState<(number | "")[]>(initPars.slice(0, 18));

  function updateYards(i: number, val: string) {
    const n = parseInt(val, 10);
    const next = [...yards];
    next[i] = isNaN(n) ? "" : n;
    setYards(next);
  }

  function updatePars(i: number, val: string) {
    const n = parseInt(val, 10);
    const next = [...pars];
    next[i] = isNaN(n) ? "" : n;
    setPars(next);
  }

  function calcTotal(arr: (number | "")[], start: number, end: number): number {
    let t = 0;
    for (let i = start; i < end; i++) {
      if (arr[i] !== "") t += arr[i] as number;
    }
    return t;
  }

  function renderSection(startIdx: number, label: string) {
    const endIdx = startIdx + 9;
    return (
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{label}</div>
        <table className="ocr-grid-table">
          <thead>
            <tr>
              <th>HOLE</th>
              {Array.from({ length: 9 }, (_, i) => (
                <th key={i}>{startIdx + i + 1}</th>
              ))}
              <th>{label === "Front 9" ? "OUT" : "IN"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: "var(--sec)", fontSize: 12, fontWeight: 600 }}>YDS</td>
              {Array.from({ length: 9 }, (_, i) => {
                const idx = startIdx + i;
                const lowConf = confidence[idx] < 0.7;
                return (
                  <td key={i} className={lowConf ? "ocr-cell-low" : "ocr-cell-ok"}>
                    <input
                      type="number"
                      value={yards[idx] === "" ? "" : yards[idx]}
                      onChange={e => updateYards(idx, e.target.value)}
                      style={{
                        width: 52, background: "transparent", border: "none",
                        color: lowConf ? "#FF9340" : "var(--white)", textAlign: "center",
                        fontSize: 13, outline: "none"
                      }}
                    />
                  </td>
                );
              })}
              <td style={{ color: "var(--sec)", fontWeight: 700 }}>
                {calcTotal(yards, startIdx, endIdx)}
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--sec)", fontSize: 12, fontWeight: 600 }}>PAR</td>
              {Array.from({ length: 9 }, (_, i) => {
                const idx = startIdx + i;
                const lowConf = confidence[idx] < 0.7;
                return (
                  <td key={i} className={lowConf ? "ocr-cell-low" : "ocr-cell-ok"}>
                    <input
                      type="number"
                      value={pars[idx] === "" ? "" : pars[idx]}
                      onChange={e => updatePars(idx, e.target.value)}
                      style={{
                        width: 32, background: "transparent", border: "none",
                        color: lowConf ? "#FF9340" : "var(--white)", textAlign: "center",
                        fontSize: 13, outline: "none"
                      }}
                    />
                  </td>
                );
              })}
              <td style={{ color: "var(--sec)", fontWeight: 700 }}>
                {calcTotal(pars, startIdx, endIdx)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="card" style={{ maxWidth: 600, width: "96%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>Review OCR Results</span>
          <button className="modal-close-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--sec)", fontSize: 13, marginBottom: 12 }}>
            Orange-highlighted cells have low confidence. Edit any values before applying.
          </p>
          {renderSection(0, "Front 9")}
          {renderSection(9, "Back 9")}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="cta-btn" style={{ flex: 1 }} onClick={() => onApply(yards, pars)}>
              Apply to Round
            </button>
            <button className="ghost-btn" style={{ flex: 1 }} onClick={onCancel}>
              Re-scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
