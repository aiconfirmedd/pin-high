import React from "react";

interface Props {
  label: string;
  hint: string;
  onDetect: (value: string) => void;
  onClose: () => void;
}

type Point = { x: number; y: number };
type Stroke = Point[];

export default function HandwritingPadModal({ label, hint, onDetect, onClose }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [_currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);
  const [detected, setDetected] = React.useState<string | null>(null);
  const detectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDrawingRef = React.useRef(false);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Point {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }

  function drawStrokes(allStrokes: Stroke[], curStroke?: Stroke | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#E87722";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawStroke = (stroke: Stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length - 1; i++) {
        const mx = (stroke[i].x + stroke[i + 1].x) / 2;
        const my = (stroke[i].y + stroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, mx, my);
      }
      ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
      ctx.stroke();
    };

    allStrokes.forEach(drawStroke);
    if (curStroke) drawStroke(curStroke);
  }

  function scheduleDetect(allStrokes: Stroke[]) {
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    detectTimerRef.current = setTimeout(() => {
      const result = recognizeStrokes(allStrokes);
      setDetected(result);
    }, 700);
  }

  function recognizeStrokes(allStrokes: Stroke[]): string {
    if (allStrokes.length === 0) return "";
    const allPoints = allStrokes.flat();
    if (allPoints.length < 2) return "";

    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = maxX - minX;
    const h = maxY - minY;

    // Horizontal dash: very wide, not tall
    if (w > h * 3 && h < 30) return "dash";

    // Single stroke analysis
    if (allStrokes.length === 1) {
      const stroke = allStrokes[0];
      const first = stroke[0];
      const last = stroke[stroke.length - 1];

      // Checkmark: goes down-left then up-right
      const mid = stroke[Math.floor(stroke.length / 2)];
      const goesDownFirst = mid.y > first.y;
      const goesRight = last.x > first.x;
      if (goesDownFirst && goesRight && last.y < mid.y) return "hit";

      // Digit recognition: try to detect based on shape
      // Simple: if it's roughly circular → 0; vertical with bump → number-like
      // Use aspect ratio and direction changes for basic digit detection
      const aspect = w / Math.max(h, 1);
      if (aspect < 0.5 && h > 40) return "1";

      // Up-right motion → checkmark/hit
      if (last.y < first.y && last.x > first.x) return "hit";
    }

    // Two strokes: X pattern
    if (allStrokes.length === 2) {
      const s1 = allStrokes[0];
      const s2 = allStrokes[1];
      if (s1.length >= 2 && s2.length >= 2) {
        const s1dx = s1[s1.length - 1].x - s1[0].x;
        const s1dy = s1[s1.length - 1].y - s1[0].y;
        const s2dx = s2[s2.length - 1].x - s2[0].x;
        const s2dy = s2[s2.length - 1].y - s2[0].y;
        // Cross: strokes go roughly opposite diagonals
        const dot = s1dx * s2dx + s1dy * s2dy;
        if (dot < 0) return "miss";
      }
      return "miss";
    }

    // Multiple strokes: likely a number or complex mark
    if (allStrokes.length >= 3) return "miss";

    // Single vertical stroke
    const aspect = w / Math.max(h, 1);
    if (aspect < 0.4) return "1";

    // Default: try to return "hit" for upward marks
    const allFirst = allStrokes[0][0];
    const allLast = allStrokes[allStrokes.length - 1][allStrokes[allStrokes.length - 1].length - 1];
    if (allLast.y < allFirst.y) return "hit";

    return "";
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const pt = getPos(e, canvas);
    setCurrentStroke([pt]);

    // Long press to clear
    longPressRef.current = setTimeout(() => {
      clearCanvas();
    }, 500);
  }

  function continueDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
    const pt = getPos(e, canvas);
    setCurrentStroke(prev => {
      const updated = [...(prev || []), pt];
      drawStrokes(strokes, updated);
      return updated;
    });
  }

  function endDraw() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
    setCurrentStroke(prev => {
      if (prev && prev.length > 0) {
        const next = [...strokes, prev];
        setStrokes(next);
        drawStrokes(next);
        scheduleDetect(next);
      }
      return null;
    });
  }

  function clearCanvas() {
    setStrokes([]);
    setCurrentStroke(null);
    setDetected(null);
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function confirm() {
    if (detected) {
      onDetect(detected);
    }
  }

  return (
    <div className="modal-overlay">
      <div style={{
        background: "var(--card)",
        borderRadius: 16,
        width: "92%",
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflow: "hidden",
      }}>
        <div className="modal-header">
          <div>
            <div style={{ color: "var(--white)", fontWeight: 700, fontSize: 18 }}>{label}</div>
            <div style={{ color: "var(--sec)", fontSize: 13, marginTop: 2 }}>{hint}</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            className="canvas-el"
            width={460}
            height={220}
            onMouseDown={startDraw}
            onMouseMove={continueDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={e => { e.preventDefault(); startDraw(e); }}
            onTouchMove={e => { e.preventDefault(); continueDraw(e); }}
            onTouchEnd={e => { e.preventDefault(); endDraw(); }}
          />
          {detected && (
            <div className="detected-badge">
              Detected: <strong>{detected}</strong>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: 16 }}>
          <button className="cta-btn" style={{ flex: 1 }} disabled={!detected} onClick={confirm}>
            Confirm
          </button>
          <button className="secondary-btn" style={{ flex: 1 }} onClick={clearCanvas}>
            Clear
          </button>
          <button className="ghost-btn" style={{ flex: 1 }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
