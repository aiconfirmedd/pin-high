import React from "react";
import Tesseract from "tesseract.js";
import { parseOcrText } from "../utils/ocrParser";

interface Props {
  onOcrComplete: (result: { yards: (number | "")[]; pars: (number | "")[]; confidence: number[] }) => void;
  onClose: () => void;
}

export default function PhotoImporter({ onOcrComplete, onClose }: Props) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setError(null);
    setProgress(0);
  }

  async function runOcr() {
    if (!imageUrl) return;
    setRunning(true);
    setError(null);
    setProgress(0);
    try {
      const result = await Tesseract.recognize(imageUrl, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const parsed = parseOcrText(result.data.text);
      onOcrComplete(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card" style={{ maxWidth: 500, width: "92%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--white)" }}>Import Scorecard Photo</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label className="cta-btn" style={{ cursor: "pointer", textAlign: "center" }}>
            Choose Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </label>

          {imageUrl && (
            <img src={imageUrl} alt="Scorecard preview"
              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--grid)" }} />
          )}

          {running && (
            <div>
              <div style={{ color: "var(--sec)", fontSize: 13, marginBottom: 6 }}>
                Recognizing text... {progress}%
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: "#ff4444", background: "#2a1111", borderRadius: 6, padding: "10px 14px", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button className="cta-btn" disabled={!imageUrl || running} onClick={runOcr}>
            {running ? "Running OCR..." : "Run OCR"}
          </button>
        </div>
      </div>
    </div>
  );
}
