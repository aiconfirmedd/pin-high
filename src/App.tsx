import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Round, Club, AppView, Hole } from "./types";
import { loadClubs, saveClubs, saveRound } from "./utils/localStorageStore";
import { supabase, OWNER_EMAIL } from "./lib/supabaseClient";
import AuthScreen from "./components/AuthScreen";
import AdminDashboard from "./components/AdminDashboard";
import FeatureRequestModal from "./components/FeatureRequestModal";
import CourseSetup from "./components/CourseSetup";
import Scorecard from "./components/Scorecard";
import RoundInsightView from "./components/RoundInsightView";
import PostRoundReflection from "./components/PostRoundReflection";
import ClubPerformanceMap from "./components/ClubPerformanceMap";
import GuidedHoleEntry from "./components/GuidedHoleEntry";

function makeDefaultClubs(): Club[] {
  const specs = [
    { name: "Driver", spec: "Titleist GT2 9Â°" },
    { name: "3 Wood", spec: "TaylorMade Qi35" },
    { name: "7 Wood", spec: "TaylorMade Qi10" },
    { name: "4 Iron", spec: "TaylorMade P790" },
    { name: "5â9 Iron / PW", spec: "TaylorMade P770" },
    { name: "50Â° GW", spec: "TaylorMade MG4" },
    { name: "54Â° SW", spec: "Vokey SM11 M Grind" },
    { name: "58Â° LW", spec: "Vokey SM11 T Grind" },
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
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [view, setView] = useState<AppView>("setup");
  const [round, setRound] = useState<Round | null>(null);
  const [clubs, setClubs] = useState<Club[]>(() => {
    const stored = loadClubs();
    return stored.length > 0 ? stored : makeDefaultClubs();
  });
  const [guidedHoleIdx, setGuidedHoleIdx] = useState<number | null>(null);
  const [showAdmin, setShowAdmin] = useState(() => window.location.pathname === "/ph-console");
  const [showFeatureReq, setShowFeatureReq] = useState(false);
  const [staleRoundBanner, setStaleRoundBanner] = useState(false);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const lastRoundUpdateRef = useRef<number>(0);

  // Auth state
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const authCode = new URLSearchParams(window.location.search).get("code");
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error("Email confirmation failed:", error.message);
        } else {
          window.history.replaceState({}, document.title, window.location.pathname || "/");
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (_event === "SIGNED_IN" && s?.user) {
        // Log login event silently
        supabase.from("login_events").insert({
          user_id: s.user.id,
          email: s.user.email,
        }).then(() => {});
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Stale round reminder: show banner if active round hasn't been updated in 15 minutes
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

  // Loading state
  if (session === undefined) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", background: "var(--bg)", color: "var(--sec)"
      }}>
        <div style={{ textAlign: "center" }}>
          <img src="/icon-192.png" alt="Pin High" style={{ width: 72, height: 72, marginBottom: 16, borderRadius: 18 }} />
          <div style={{ fontSize: 12, letterSpacing: 1 }}>LOADINGâ¦</div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return <AuthScreen onAuth={() => {}} />;
  }

  const userEmail = session.user.email ?? "";
  const isOwner = userEmail === OWNER_EMAIL;

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
    // Sync to Supabase in background
    supabase.from("rounds").upsert({
      id: r.id,
      user_id: session!.user.id,
      course_name: r.courseName,
      tee_name: r.teeName,
      date: r.date,
      player_name: r.playerName ?? null,
      holes: r.holes,
      updated_at: new Date().toISOString(),
    }).then(() => {});
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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const navItems: { id: AppView; label: string; icon: string }[] = [
    { id: "scorecard", label: "Scorecard", icon: "â³" },
    { id: "insight", label: "Insight", icon: "ð" },
    { id: "clubs", label: "Clubs", icon: "ðï¸" },
    { id: "reflection", label: "Reflect", icon: "âï¸" },
    { id: "setup", label: "More", icon: "â°" },
  ];

  const showGuidedEntry = guidedHoleIdx !== null && round !== null;

  return (
    <div className="app">
      {/* Admin Dashboard (owner only, hidden route) */}
      {showAdmin && isOwner && (
        <AdminDashboard onClose={() => {
          setShowAdmin(false);
          window.history.pushState({}, "", "/");
        }} />
      )}

      {/* Feature Request Modal */}
      {showFeatureReq && (
        <FeatureRequestModal
          userId={session.user.id}
          email={userEmail}
          onClose={() => setShowFeatureReq(false)}
        />
      )}

      {/* Main content */}
      <div className="app-content">
        {view === "setup" && (
          <div>
            <CourseSetup onStart={handleRoundStart} />
            {/* Menu Footer */}
            <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="ghost-btn"
                style={{ width: "100%", textAlign: "left", padding: "12px 16px" }}
                onClick={() => setShowFeatureReq(true)}
              >
                ð¡ Suggest a Feature
              </button>
              {isOwner && (
                <button
                  className="ghost-btn"
                  style={{ width: "100%", textAlign: "left", padding: "12px 16px" }}
                  onClick={() => {
                    window.history.pushState({}, "", "/ph-console");
                    setShowAdmin(true);
                  }}
                >
                  âï¸ Dashboard
                </button>
              )}
              <button
                className="ghost-btn"
                style={{ width: "100%", textAlign: "left", padding: "12px 16px", color: "var(--muted)" }}
                onClick={handleSignOut}
              >
                Sign Out Â· {userEmail}
              </button>
            </div>
          </div>
        )}

        {view === "scorecard" && staleRoundBanner && round && (
          <div style={{
            background: "#c47a2a22", border: "1px solid var(--copper)", borderRadius: 10,
            padding: "12px 16px", margin: "12px 16px 0", display: "flex", alignItems: "center",
            gap: 12, position: "relative",
          }}>
            <span style={{ fontSize: 20 }}>â±ï¸</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--copper)", fontWeight: 700, fontSize: 13 }}>Still playing?</div>
              <div style={{ color: "var(--sec)", fontSize: 12 }}>No score updates in 15+ minutes. Tap a hole to continue.</div>
            </div>
            <button
              onClick={() => setStaleRoundBanner(false)}
              style={{ background: "none", border: "none", color: "var(--sec)", cursor: "pointer", fontSize: 18, padding: 4 }}
              aria-label="Dismiss"
            >â</button>
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
                background: "var(--copper)", color: "#fff", borderRadius: 12, padding: "14px 20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 200, maxWidth: 340, width: "90%",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>âï¸</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Log your reflections?</div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Capture what worked and what to improve.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => { setView("reflection"); setShowReflectionPrompt(false); }}
                    style={{ background: "#fff", color: "var(--copper)", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
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
