import React from "react";
import type { Round, ReflectionAnswer, RoundReflection } from "../types";
import { saveReflection } from "../utils/localStorageStore";

interface Props {
  round: Round;
  onSave: () => void;
  onBack: () => void;
}

type QuestionDef = {
  id: string;
  label: string;
  options: string[];
  multi?: boolean;
  freeText?: boolean;
};

const QUESTIONS: QuestionDef[] = [
  {
    id: "driver-miss",
    label: "Driver miss today?",
    options: ["Straight", "Block right", "Pull left", "Push fade", "Duck hook", "No pattern", "Not used"],
  },
  {
    id: "iron-miss",
    label: "Iron/approach miss shape?",
    options: ["Thin", "Short", "Fat", "Right", "Left", "Long", "Clean contact"],
    multi: true,
  },
  {
    id: "short-game-miss",
    label: "Short game miss pattern?",
    options: ["Thin running through", "Fat/short", "Tight lies nerves", "Club selection off", "Solid today"],
  },
  {
    id: "putting-miss",
    label: "Putting — main miss?",
    options: ["Pushed right", "Pulled left", "Speed long", "Speed short", "Good speed", "Line reading"],
  },
  {
    id: "swing-thought",
    label: "Swing thought that helped most?",
    options: [],
    freeText: true,
  },
  {
    id: "course-management",
    label: "Course management — what to change?",
    options: ["More conservative off tee", "Aim away from tight pins", "Club up on par 3s", "Better lay-up distances", "Managed well"],
  },
  {
    id: "practice-priority",
    label: "Top practice priority before next round?",
    options: ["Short game 50–80yd wedges", "Driver shape control", "Mid-iron GIR", "Putting speed/reads", "Bunker play", "Full swing tempo"],
  },
];

export default function PostRoundReflection({ round, onSave, onBack }: Props) {
  const [qIdx, setQIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<ReflectionAnswer[]>(
    QUESTIONS.map(q => ({ questionId: q.id, selected: [], freeText: "" }))
  );

  const q = QUESTIONS[qIdx];
  const answer = answers[qIdx];
  const progress = ((qIdx + 1) / QUESTIONS.length) * 100;

  function toggleOption(opt: string) {
    setAnswers(prev => {
      const next = [...prev];
      const cur = next[qIdx].selected;
      if (q.multi) {
        const has = cur.includes(opt);
        next[qIdx] = {
          ...next[qIdx],
          selected: has ? cur.filter(x => x !== opt) : [...cur, opt],
        };
      } else {
        next[qIdx] = { ...next[qIdx], selected: [opt] };
      }
      return next;
    });
  }

  function setFreeText(text: string) {
    setAnswers(prev => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], freeText: text };
      return next;
    });
  }

  function next() {
    if (qIdx < QUESTIONS.length - 1) setQIdx(qIdx + 1);
  }

  function prev() {
    if (qIdx > 0) setQIdx(qIdx - 1);
  }

  function handleSave() {
    const reflection: RoundReflection = {
      roundId: round.id,
      answers,
      savedAt: new Date().toISOString(),
    };
    saveReflection(reflection);
    onSave();
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>
          <span className="back-btn-chevron">‹</span>
          <span>Back</span>
        </button>
        <span className="screen-header-title">Reflection</span>
        <div className="screen-header-action">
          <button className="back-btn" style={{ color: "var(--sec)", fontSize: 13 }} onClick={handleSave}>Skip</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ borderRadius: 0, height: 4 }}>
        <div className="progress-fill" style={{ width: `${progress}%`, transition: "width 0.3s ease" }} />
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ color: "var(--sec)", fontSize: 12, marginBottom: 6 }}>
          Question {qIdx + 1} of {QUESTIONS.length}
        </div>
        <div style={{ color: "var(--white)", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          {q.label}
        </div>

        {q.options.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {q.options.map(opt => (
              <button
                key={opt}
                className={`reflect-opt ${answer.selected.includes(opt) ? "reflect-opt-selected" : ""} ${q.multi ? "reflect-opt-multi" : ""}`}
                onClick={() => toggleOption(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.freeText && (
          <textarea
            value={answer.freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="Write your thoughts..."
            rows={4}
            style={{
              width: "100%", background: "var(--surface2)", border: "1px solid var(--grid)",
              borderRadius: 8, padding: "12px", color: "var(--white)", fontSize: 15,
              resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
            }}
          />
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {qIdx > 0 && (
            <button className="secondary-btn" style={{ flex: 1 }} onClick={prev}>← Back</button>
          )}
          {qIdx < QUESTIONS.length - 1 ? (
            <button className="cta-btn" style={{ flex: 2 }} onClick={next}>
              Next →
            </button>
          ) : (
            <button className="cta-btn" style={{ flex: 2 }} onClick={handleSave}>
              Save Reflection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
