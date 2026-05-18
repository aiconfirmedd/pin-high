import React from "react";
import type { Round, Club, AppView, Hole } from "./types";
import { loadClubs, saveClubs, saveRound } from "./utils/localStorageStore";
import CourseSetup from "./components/CourseSetup";
import Scorecard from "./components/Scorecard";
import RoundInsightView from "./components/RoundInsightView";
import PostRoundReflection from "./components/PostRoundReflection";
import ClubPerformanceMap from "./components/ClubPerformanceMap";
import GuidedHoleEntry from "./components/GuidedHoleEntry";

function makeDefaultClubs(): Club[] {
  const specs = [
    { name: "Driver", spec: "Titleist GT2 9°" },
    { name: "3 Wood", spec: "TaylorMade Qi35" },
    { name: "7 Wood", spec: "TaylorMade Qi10" },
    { name: "4 Iron", spec: "TaylorMade P790" },
    { name: "5–9 Iron / PW", spec: "TaylorMade P770" },
    { name: "50° GW", spec: "TaylorMade MG4" },
    { name: "54° SW", spec: "Vokey SM11 M Grind" },
    { name: "58° LW", spec: "Vokey SM11 T Grind" },
    { name: "Putter", spec: "Scotty Cameron Fastback 2.5" },
  ];
  return specs.map((s, i) => ({
    id: `club-${i}`,
    name: s.name,
    spec: s.spec,
    status: "normal" as const,
    mainMiss: "",
    approachDist: "" as const,
    carryDist: "" as const,
    totalDist: "" as const,
    stockDist: "" as const,
    partialDist: "" as const,
    notes: "",
  }));
}

export default function App() {
  const [view, setView] = React.useState<AppView>("setup");
  const [round, setRound] = React.useState<Round | null>(null);
  const [clubs, setClubs] = React.useState<Club[]>(() => {
    const stored = loadClubs();
    return stored.length > 0 ? stored : makeDefaultClubs();
  });
  const [guidedHoleIdx, setGuidedHoleIdx] = React.useState<number | null>(null);

  function handleRoundStart(r: Round) {
    setRound(r);
    setView("scorecard");
  }

  function handleRoundChange(r: Round) {
    setRound(r);
    saveRound(r);
  }

  function handleClubsChange(c: Club[]) {
    setClubs(c);
    saveClubs(c);
  }

  function handleHoleClick(idx: number) {
    setGuidedHoleIdx(idx);
  }

  function handleHoleSave(hole: Hole) {
    if (round === null || guidedHoleIdx === null) return;
    const next = round.holes.map((h, i) => i === guidedHoleIdx ? hole : h);
    handleRoundChange({ ...round, holes: next });
    setGuidedHoleIdx(null);
  }

  const navItems: { id: AppView; label: string; icon: string }[] = [
    { id: "scorecard", label: "Scorecard", icon: "⛳" },
    { id: "insight", label: "Insight", icon: "📊" },
    { id: "clubs", label: "Clubs", icon: "🏌️" },
    { id: "reflection", label: "Reflect", icon: "✍️" },
    { id: "setup", label: "Settings", icon: "⚙️" },
  ];

  function handleNavClick(id: AppView) {
    if (id === "setup") {
      alert("Coming soon");
      return;
    }
    setView(id);
  }

  const showGuidedEntry = guidedHoleIdx !== null && round !== null;

  return (
    <div className="app">
      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "setup" && (
          <CourseSetup onStart={handleRoundStart} />
        )}

        {view === "scorecard" && round && (
          <Scorecard
            round={round}
            onRoundChange={handleRoundChange}
            onViewInsight={() => setView("insight")}
            onHoleClick={handleHoleClick}
          />
        )}

        {view === "scorecard" && !round && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ color: "var(--sec)", fontSize: 16, marginBottom: 16 }}>No active round</div>
            <button className="cta-btn" onClick={() => setView("setup")}>Start New Round</button>
          </div>
        )}

        {view === "insight" && round && (
          <RoundInsightView
            round={round}
            clubs={clubs}
            onReflect={() => setView("reflection")}
            onBack={() => setView("scorecard")}
          />
        )}

        {view === "insight" && !round && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ color: "var(--sec)", fontSize: 16, marginBottom: 16 }}>No round data yet</div>
            <button className="cta-btn" onClick={() => setView("setup")}>Start New Round</button>
          </div>
        )}

        {view === "reflection" && round && (
          <PostRoundReflection
            round={round}
            onSave={() => setView("insight")}
            onBack={() => setView("insight")}
          />
        )}

        {view === "reflection" && !round && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ color: "var(--sec)", fontSize: 16 }}>Complete a round first</div>
          </div>
        )}

        {view === "clubs" && (
          <ClubPerformanceMap clubs={clubs} onClubsChange={handleClubsChange} />
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`bnav-item ${view === item.id ? "bnav-active" : ""}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="bnav-icon">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Guided Hole Entry overlay */}
      {showGuidedEntry && round && guidedHoleIdx !== null && (
        <GuidedHoleEntry
          round={round}
          holeIndex={guidedHoleIdx}
          onSave={handleHoleSave}
          onClose={() => setGuidedHoleIdx(null)}
        />
      )}
    </div>
  );
}
