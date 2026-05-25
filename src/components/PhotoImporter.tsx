import React from "react";
import Tesseract from "tesseract.js";
import { parseOcrText } from "../utils/ocrParser";

interface Props {
  onOcrComplete: (result: { yards: (number | "")[]; pars: (number | "")[]; confidence: number[]; courseName?: string; courseNameConfidence?: number }) => void;
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
          <button className="icon-btn" onClick={onClose} aria-label="Close">X</button>
        </div>

        <div style={{ padding: "16px 16px 0" }}>
          <p style={{ color: "var(--sec)", fontSize: 13, marginBottom: 12 }}>
            Take a photo of your scorecard to auto-fill yardages, pars, and course name.
          </p>

          <label style={{
            display: "block",
            border: "2px dashed var(--border)",
            borderRadius: 10,
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            color: "var(--sec)",
            fontSize: 14,
            marginBottom: 12,
          }}>
            {imageUrl ? (
              <img src={imageUrl} alt="Scorecard preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6 }} />
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>Photo</div>
                <div>Tap to select or take a photo</div>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </label>

          {error && (
            <div style={{ color: "#e05", fontSize: 13, marginBottom: 10 }}>{error}</div>
          )}

          {running && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "var(--sec)", fontSize: 12, marginBottom: 4 }}>Scanning... {progress}%</div>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--orange)", borderRadius: 2, transition: "width 0.2s" }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 16px 20px", display: "flex", gap: 10 }}>
          <button
            className="cta-btn"
            style={{ flex: 1 }}
            disabled={!imageUrl || running}
            onClick={runOcr}
          >
            {running ? "Scanning..." : "Scan Scorecard"}
          </button>
          <button className="ghost-btn" onClick={onClose} style={{ minWidth: 80 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
