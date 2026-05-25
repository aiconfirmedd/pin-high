import { useEffect, useRef, useState } from "react";
import type { Round, Club, AppView, Hole } from "./types";
import {
  clearLocalSession,
  loadClubs,
  loadLocalSession,
  saveClubs,
  saveRound,
  type LocalUserSession,
} from "./utils/localStorageStore";
import AuthScreen from "./components/AuthScreen";
import CourseSetup from "./components/CourseSetup";
import Scorecard from "./components/Scorecard";
import RoundInsightView from "./components/RoundInsightView";
import PostRoundReflection from "./components/PostRoundReflection";
import ClubPerformanceMap from "./components/ClubPerformanceMap";
import GuidedHoleEntry from "./components/GuidedHoleEntry";
import ImportView from "./components/ImportView";
import { CaddieMode } from "./components/CaddieMode";

function makeDefaultClubs(): Club[] {
  const specs = [
    { name: "Driver", spec: "Titleist GT2 9deg" },
    { name: "3 Wood", spec: "TaylorMade Qi35" },
    { name: "7 Wood", spec: "TaylorMade Qi10" },
    { name: "4 Iron", spec: "TaylorMade P790" },
    { name: "5-9 Iron / PW", spec: "TaylorMade P770" },
    { name: "50deg GW", spec: "TaylorMade MG4" },
    { name: "54deg SW", spec: "Vokey SM11 M Grind" },
    { name: "58deg LW", spec: "Vokey SM11 T Grind" },
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
  const [session, setSession] = useState<LocalUserSession | null>(() => loadLocalSession());
  const [view, setView] = useState<AppView>("setup");
  const [round, setRound] = useState<Round | null>(null);
  const [clubs, setClubs] = useState<Club[]>(() => {
    const stored = loadClubs();
    return stored.length > 0 ? stored : makeDefaultClubs();
  });
  const [guidedHoleIdx, setGuidedHoleIdx] = useState<number | null>(null);
  const [staleRoundBanner, setStaleRoundBanner] = useState(false);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const lastRoundUpdateRef = useRef<number>(0);
  const appContentRef = useRef<HTMLDivElement | null>(null);

  // Stale round reminder: show banner if active round has not been updated in 15 minutes.
  useEffect(() => {
    const CHECK_INTERVAL = 60_000; // check every 60s
    const STALE_THRESHOLD = 15 * 60_000; // 15 minutes
    const id = setInterval(() => {
      if (round && view === "scorecard") {
        const idle = Date.now() - lastRoundUpdateRef.current;
        if (idle >= STALE_THRESHOLD) {
          setStaleRoundBanner(true);
        }
      }
    }, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [round, view]);

  useEffect(() => {
    appContentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [view, round?.id]);

  // Not signed in
  if (!session) {
    return <AuthScreen onAuth={setSession} />;
  }

  function handleRoundStart(r: Round) {
    setRound(r);
    setView("scorecard");
    lastRoundUpdateRef.current = Date.now();
    setStaleRoundBanner(false);
    setShowReflectionPrompt(false);
  }

  function handleRoundChange(r: Round) {
    setRound(r);
    saveRound(r);
    lastRoundUpdateRef.current = Date.now();
    setStaleRoundBanner(false);
  }

  function handleClubsChange(c: Club[]) {
    setClubs(c);
    saveClubs(c);
  }

  function handleImportComplete(importedRound: Round) {
    saveRound(importedRound);
    setRound(importedRound);
    setView("insight");
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

  function handleSignOut() {
    clearLocalSession();
    setSession(null);
    setRound(null);
    setView("setup");
  }

  const navItems: { id: AppView; label: string; icon: string }[] = [
    { id: "scorecard", label: "Scorecard", icon: "🏌" },
    { id: "caddie", label: "Caddie", icon: "🧭" },
    { id: "insight", label: "Insight", icon: "📊" },
    { id: "clubs", label: "Clubs", icon: "⛳" },
    { id: "setup", label: "More", icon: "☰" },
  ];

  const showGuidedEntry = guidedHoleIdx !== null && round !== null;

  return (
    <div className="app">
      {/* Main content */}
      <div className="app-content" ref={appContentRef}>
        {view === "setup" && (
          <div>
            <CourseSetup onStart={handleRoundStart} />
            {/* Menu Footer */}
            <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="ghost-btn"
                style={{ width: "100%", textAlign: "left", padding: "12px 16px" }}
                onClick={() => setView("import")}
              >
                &#128513; Import from 18Birdies
              </button>
              <button
                className="ghost-btn"
                style={{ width: "100%", textAlign: "left", padding: "12px 16px", color: "var(--muted)" }}
                onClick={handleSignOut}
              >
                Sign Out - {session.name}
              </button>
            </div>
          </div>
        )}

        {view === "scorecard" && staleRoundBanner && round && (
          <div style={{
            background: "rgba(232, 119, 34, 0.14)", border: "1px solid var(--orange)", borderRadius: 10,
            padding: "12px 16px", margin: "12px 16px 0", display: "flex", alignItems: "center",
            gap: 12, position: "relative",
          }}>
            <span style={{ fontSize: 20 }}>!</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13 }}>Still playing?</div>
              <div style={{ color: "var(--sec)", fontSize: 12 }}>No score updates in 15+ minutes. Tap a hole to continue.</div>
            </div>
            <button
              onClick={() => setStaleRoundBanner(false)}
              style={{ background: "none", border: "none", color: "var(--sec)", cursor: "pointer", fontSize: 18, padding: 4 }}
              aria-label="Dismiss"
            >×</button>
          </div>
        )}

        {view === "scorecard" && round && (
          <Scorecard
            round={round}
            onRoundChange={handleRoundChange}
            onViewInsight={() => {
              setView("insight");
              setShowReflectionPrompt(true);
            }}
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
          <>
            <RoundInsightView
              round={round}
              clubs={clubs}
              onReflect={() => { setView("reflection"); setShowReflectionPrompt(false); }}
              onBack={() => setView("scorecard")}
            />
            {showReflectionPrompt && (
              <div style={{
                position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
                background: "var(--orange)", color: "#fff", borderRadius: 12, padding: "14px 20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 200, maxWidth: 340, width: "90%",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>R</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Log your reflections?</div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Capture what worked and what to improve.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => { setView("reflection"); setShowReflectionPrompt(false); }}
                    style={{ background: "#fff", color: "var(--orange)", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                  >Yes</button>
                  <button
                    onClick={() => setShowReflectionPrompt(false)}
                    style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}
                  >Skip</button>
                </div>
              </div>
            )}
          </>
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

        {view === "import" && (
          <ImportView
            onImportComplete={handleImportComplete}
            onClose={() => setView("setup")}
          />
        )}

        {view === "caddie" && (
          <CaddieMode
            onClose={() => setView("scorecard")}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`bnav-item ${view === item.id ? "bnav-active" : ""}`}
            onClick={() => setView(item.id)}
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
