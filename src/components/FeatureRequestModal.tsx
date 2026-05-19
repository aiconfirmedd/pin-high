import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeatureRequestModal({
  userId,
  email,
  onClose,
}: {
  userId: string;
  email: string;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await supabase.from("feature_requests").insert({
      user_id: userId,
      email,
      content: text.trim(),
    });
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxWidth: 420, width: "92%", borderRadius: 16 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--copper-shine)" }}>
            💡 Suggest a Feature
          </span>
          <button onClick={onClose} style={{ color: "var(--sec)", fontSize: 18, background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 16 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--copper-shine)", fontSize: 15, fontWeight: 600 }}>
              ✓ Thanks! Your idea was submitted.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: 13, color: "var(--sec)", marginBottom: 12, lineHeight: 1.5 }}>
                What would make Pin High better for your game? Any idea is welcome.
              </p>
              <textarea
                className="form-input"
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. Add GPS distance to each hole…"
                style={{ resize: "none", width: "100%", fontSize: 14 }}
                autoFocus
              />
              <button
                type="submit"
                className="cta-btn"
                style={{ width: "100%", marginTop: 12 }}
                disabled={loading || !text.trim()}
              >
                {loading ? "Submitting…" : "Submit Idea"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
