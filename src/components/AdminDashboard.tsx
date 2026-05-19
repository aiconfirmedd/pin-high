import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_seen: string;
}

interface LoginEvent {
  id: string;
  email: string;
  logged_in_at: string;
}

interface Round {
  id: string;
  user_id: string;
  course_name: string;
  date: string;
  player_name: string | null;
  holes: unknown;
}

interface FeatureRequest {
  id: string;
  email: string;
  content: string;
  created_at: string;
}

type Tab = "users" | "logins" | "rounds" | "ideas";

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logins, setLogins] = useState<LoginEvent[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [ideas, setIdeas] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [p, l, r, f] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("login_events").select("*").order("logged_in_at", { ascending: false }).limit(100),
      supabase.from("rounds").select("id, user_id, course_name, date, player_name, holes").order("date", { ascending: false }),
      supabase.from("feature_requests").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.data) setProfiles(p.data);
    if (l.data) setLogins(l.data);
    if (r.data) setRounds(r.data);
    if (f.data) setIdeas(f.data);
    setLoading(false);
  }

  function fmt(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "users", label: "Users", count: profiles.length },
    { id: "logins", label: "Logins", count: logins.length },
    { id: "rounds", label: "Rounds", count: rounds.length },
    { id: "ideas", label: "Ideas", count: ideas.length },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 200, display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg,#1E1E20 0%,#101012 100%)",
        borderBottom: "1px solid #3A3A3C",
        padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, color: "var(--copper-shine)" }}>
            DASHBOARD
          </div>
          <div style={{ fontSize: 11, color: "var(--sec)", marginTop: 2 }}>
            Pin High · Owner View
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "var(--surface2)", border: "1px solid var(--grid)",
            borderRadius: 8, padding: "6px 12px", color: "var(--white)",
            fontSize: 13, cursor: "pointer"
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--grid)",
        background: "var(--card)", flexShrink: 0
      }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600,
              color: tab === t.id ? "var(--copper-shine)" : "var(--sec)",
              borderBottom: `2px solid ${tab === t.id ? "var(--copper)" : "transparent"}`,
              background: "none", border: "none",
              cursor: "pointer"
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 4, background: "var(--surface2)",
                borderRadius: 10, padding: "1px 6px", fontSize: 10
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--sec)" }}>
            Loading…
          </div>
        )}

        {!loading && tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profiles.length === 0 && <div style={{ color: "var(--sec)", textAlign: "center", padding: 40 }}>No users yet</div>}
            {profiles.map(p => (
              <div key={p.id} style={{
                background: "var(--card)", border: "1px solid var(--grid)",
                borderRadius: 10, padding: "12px 14px"
              }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.email}</div>
                {p.display_name && <div style={{ fontSize: 12, color: "var(--sec)" }}>{p.display_name}</div>}
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "flex", gap: 12 }}>
                  <span>Joined: {fmt(p.created_at)}</span>
                  <span>Last seen: {fmt(p.last_seen)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "logins" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logins.length === 0 && <div style={{ color: "var(--sec)", textAlign: "center", padding: 40 }}>No login events yet</div>}
            {logins.map(l => (
              <div key={l.id} style={{
                background: "var(--card)", border: "1px solid var(--grid)",
                borderRadius: 10, padding: "10px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{l.email}</div>
                <div style={{ fontSize: 11, color: "var(--sec)" }}>{fmt(l.logged_in_at)}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "rounds" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rounds.length === 0 && <div style={{ color: "var(--sec)", textAlign: "center", padding: 40 }}>No rounds logged yet</div>}
            {rounds.map(r => {
              const holes = Array.isArray(r.holes) ? r.holes as Array<{score?: number; par?: number}> : [];
              const totalScore = holes.reduce((s: number, h) => s + (h.score || 0), 0);
              const totalPar = holes.reduce((s: number, h) => s + (h.par || 0), 0);
              const diff = totalScore - totalPar;
              return (
                <div key={r.id} style={{
                  background: "var(--card)", border: "1px solid var(--grid)",
                  borderRadius: 10, padding: "12px 14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.course_name}</div>
                    {totalScore > 0 && (
                      <div style={{
                        fontSize: 14, fontWeight: 800,
                        color: diff < 0 ? "var(--copper-shine)" : diff === 0 ? "var(--white)" : "var(--sec)"
                      }}>
                        {totalScore} ({diff > 0 ? `+${diff}` : diff})
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--sec)", marginTop: 4, display: "flex", gap: 12 }}>
                    <span>{r.date}</span>
                    {r.player_name && <span>{r.player_name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "ideas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ideas.length === 0 && <div style={{ color: "var(--sec)", textAlign: "center", padding: 40 }}>No feature ideas yet</div>}
            {ideas.map(f => (
              <div key={f.id} style={{
                background: "var(--card)", border: "1px solid var(--grid)",
                borderRadius: 10, padding: "12px 14px"
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{f.content}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, display: "flex", gap: 12 }}>
                  <span>{f.email}</span>
                  <span>{fmt(f.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
