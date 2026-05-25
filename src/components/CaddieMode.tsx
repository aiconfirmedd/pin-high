// src/components/CaddieMode.tsx
// Pin High — Caddie Mode
// Live GPS + course layout + wind + club recommendation
// Design: Luxury Dark Metal (copper/bronze on near-black steel)

import { useState, useEffect, useRef } from "react";
import { recommendClub, MY_BAG, MY_STATS, type ClubEntry } from "../data/playerProfile";
import { CALUSA_CC, type CourseStrategyDoc } from "../data/courseStrategy";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LatLon { lat: number; lon: number; }

interface HazardZone {
  type: "bunker" | "water" | "trees" | "rough" | "ob";
  label?: string;
  /** center in yards from tee, [x=left/right, y=distance] */
  center: [number, number];
  radius: number; // yards
}

interface LayupZone {
  label: string;
  distanceYds: number;
  side: "left" | "right" | "center";
  note?: string;
}

interface HoleData {
  number: number;
  par: number;
  yardage: { white: number; blue: number; red: number };
  handicap: number;
  teeLatLon?: LatLon;
  pinLatLon?: LatLon;
  hazards: HazardZone[];
  layupZones: LayupZone[];
  fairwayWidthYds: number;
  doglegs?: { distanceYds: number; direction: "left" | "right"; angle: number }[];
  strategy?: string;
  avoidZones?: string[];
  attackFrom?: string;
}

interface WindData {
  speedMph: number;
  directionDeg: number; // 0=N, 90=E, 180=S, 270=W
  gust?: number;
  source: "api" | "manual";
}

// ─── Demo hole data (Sierra Lakes #1 approximated) ───────────────────────────

const DEMO_HOLE: HoleData = {
  number: 1,
  par: 4,
  yardage: { white: 392, blue: 412, red: 340 },
  handicap: 9,
  hazards: [
    { type: "bunker", label: "Left fairway bunker", center: [-20, 210], radius: 18 },
    { type: "bunker", label: "Right greenside", center: [22, 370], radius: 14 },
    { type: "water",  label: "Creek right",         center: [35, 180], radius: 20 },
    { type: "trees",  label: "OB left trees",        center: [-55, 250], radius: 30 },
  ],
  layupZones: [
    { label: "Lay-up short of creek", distanceYds: 155, side: "left",   note: "Leaves 140 in" },
    { label: "Preferred landing zone", distanceYds: 210, side: "center", note: "Best angle to pin" },
  ],
  fairwayWidthYds: 38,
  doglegs: [{ distanceYds: 240, direction: "left", angle: 18 }],
  strategy: "Drive left-center to avoid creek right. Full approach from 160–180 plays best to this green. Don't short-side right — bunker makes up-and-down nearly impossible.",
  avoidZones: ["Right of fairway (creek)", "Right greenside bunker"],
  attackFrom: "Left-center fairway, 150–175 yds",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function haversineYards(a: LatLon, b: LatLon): number {
  const R = 6371000; // meters
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lon - a.lon) * Math.PI) / 180;
  const aa = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return (2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))) * 1.09361;
}

function compassLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function distanceColor(yds: number): string {
  if (yds <= 100) return "#3DAA45";
  if (yds <= 150) return "#D4C44A";
  if (yds <= 200) return "#C4762A";
  return "#E05555";
}

// ─── Wind Compass ─────────────────────────────────────────────────────────────

function WindCompass({ wind }: { wind: WindData }) {
  const arrowRad = (wind.directionDeg * Math.PI) / 180;
  const cx = 36, cy = 36, r = 28;
  const ax = cx + r * Math.sin(arrowRad);
  const ay = cy - r * Math.cos(arrowRad);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={72} height={72} style={{ overflow: "visible" }}>
        {/* Compass ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3A3A3C" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke="#2C2C2E" strokeWidth={8} />
        {/* Cardinal marks */}
        {["N","E","S","W"].map((dir, i) => {
          const a = (i * 90 * Math.PI) / 180;
          return (
            <text key={dir} x={cx + (r - 4) * Math.sin(a)} y={cy - (r - 4) * Math.cos(a)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={8} fill={dir === "N" ? "#C4762A" : "#8E8E93"} fontWeight="700">
              {dir}
            </text>
          );
        })}
        {/* Wind arrow */}
        <line x1={cx} y1={cy} x2={ax} y2={ay}
          stroke="#C4762A" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={ax} cy={ay} r={3} fill="#C4762A" />
        <circle cx={cx} cy={cy} r={3} fill="#48484A" />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#F5F5F7", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
          {wind.speedMph} <span style={{ fontSize: 11, color: "#8E8E93" }}>mph</span>
        </div>
        <div style={{ color: "#8E8E93", fontSize: 11 }}>{compassLabel(wind.directionDeg)}</div>
        {wind.gust && <div style={{ color: "#C4762A", fontSize: 10 }}>Gusts {wind.gust}</div>}
      </div>
    </div>
  );
}

// ─── Hole Map (SVG top-down view) ─────────────────────────────────────────────

function HoleMap({
  hole, playerDistFromPin, playerDistFromTee
}: {
  hole: HoleData;
  playerDistFromPin: number;
  playerDistFromTee: number;
}) {
  const W = 200, H = 340;
  const totalYds = hole.yardage.white;
  // Map yards to SVG pixels: tee at bottom, pin at top
  const yScale = (H - 40) / totalYds;
  const cx = W / 2;

  const ydsToY = (yds: number) => H - 20 - yds * yScale;
  const playerY = ydsToY(playerDistFromTee);

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      {/* Background */}
      <rect width={W} height={H} fill="#1A1A1C" rx={12} />

      {/* Rough area */}
      <rect x={cx - 55} y={ydsToY(totalYds)} width={110} height={totalYds * yScale} fill="#1E3320" rx={4} />

      {/* Fairway shape */}
      <rect x={cx - (hole.fairwayWidthYds / 2) * yScale * 2}
        y={ydsToY(totalYds - 30)}
        width={hole.fairwayWidthYds * yScale * 2}
        height={(totalYds - 60) * yScale}
        fill="#2D5A35" rx={6} />

      {/* Dogleg indicator */}
      {hole.doglegs?.map((dog, i) => (
        <g key={i}>
          <line
            x1={cx} y1={ydsToY(dog.distanceYds)}
            x2={cx + (dog.direction === "left" ? -20 : 20)} y2={ydsToY(dog.distanceYds - 10)}
            stroke="#D4C44A" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
          />
          <text x={cx + (dog.direction === "left" ? -32 : 28)} y={ydsToY(dog.distanceYds)}
            fill="#D4C44A" fontSize={8} opacity={0.8}>
            {dog.direction === "left" ? "◄" : "►"} dogleg
          </text>
        </g>
      ))}

      {/* Hazards */}
      {hole.hazards.map((h, i) => {
        const hx = cx + h.center[0] * 0.8;
        const hy = ydsToY(h.center[1]);
        const rx = h.radius * 0.9;
        const ry = h.radius * 0.55;
        const color = h.type === "water" ? "#1A5CA8"
          : h.type === "bunker" ? "#C8B96A"
          : h.type === "trees" ? "#1A4020"
          : "#8B4E1A";
        const stroke = h.type === "water" ? "#2D7ACC"
          : h.type === "bunker" ? "#D4C44A"
          : h.type === "trees" ? "#2D6030"
          : "#C4762A";
        return (
          <g key={i}>
            <ellipse cx={hx} cy={hy} rx={rx} ry={ry} fill={color} stroke={stroke} strokeWidth={1} opacity={0.85} />
            {h.type === "water" && (
              <text x={hx} y={hy} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#6AAFDD">≋</text>
            )}
            {h.type === "bunker" && (
              <text x={hx} y={hy} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#8B7A30">⊡</text>
            )}
          </g>
        );
      })}

      {/* Layup zones */}
      {hole.layupZones.map((z, i) => {
        const zy = ydsToY(z.distanceYds);
        const zx = z.side === "left" ? cx - 18 : z.side === "right" ? cx + 18 : cx;
        return (
          <g key={i} opacity={0.6}>
            <circle cx={zx} cy={zy} r={5} fill="none" stroke="#C4762A" strokeWidth={1} strokeDasharray="3 2" />
            <line x1={cx - 30} x2={cx + 30} y1={zy} y2={zy}
              stroke="#C4762A" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.4} />
            <text x={cx + 35} y={zy + 3} fontSize={7} fill="#C4762A">{z.distanceYds}y</text>
          </g>
        );
      })}

      {/* Green */}
      <ellipse cx={cx} cy={ydsToY(totalYds - 15)} rx={22} ry={14} fill="#3DAA45" stroke="#2D8A35" strokeWidth={1.5} />
      {/* Pin */}
      <line x1={cx} y1={ydsToY(totalYds - 15) - 14} x2={cx} y2={ydsToY(totalYds - 15) - 28}
        stroke="#F5F5F7" strokeWidth={1.5} />
      <polygon points={`${cx},${ydsToY(totalYds - 15) - 28} ${cx + 8},${ydsToY(totalYds - 15) - 22} ${cx},${ydsToY(totalYds - 15) - 22}`}
        fill="#E05555" />

      {/* Tee box */}
      <rect x={cx - 8} y={H - 22} width={16} height={8} fill="#4A4A4C" rx={2} />
      <text x={cx} y={H - 15} textAnchor="middle" fontSize={7} fill="#8E8E93">TEE</text>

      {/* Distance rings from pin */}
      {[100, 150, 200].map(d => {
        const ringY = ydsToY(totalYds - 15 - d);
        return (
          <g key={d}>
            <line x1={cx - 35} x2={cx + 35} y1={ringY} y2={ringY}
              stroke={distanceColor(d)} strokeWidth={0.5} strokeDasharray="3 5" opacity={0.35} />
            <text x={cx - 38} y={ringY + 3} textAnchor="end" fontSize={7}
              fill={distanceColor(d)} opacity={0.6}>{d}</text>
          </g>
        );
      })}

      {/* Player position */}
      {playerDistFromTee > 0 && playerDistFromTee < totalYds && (
        <g>
          <circle cx={cx} cy={playerY} r={7} fill="#C4762A" opacity={0.25} />
          <circle cx={cx} cy={playerY} r={4} fill="#C4762A" />
          <text x={cx + 12} y={playerY + 4} fontSize={9} fill="#C4762A" fontWeight="700">
            {Math.round(playerDistFromPin)}y
          </text>
        </g>
      )}

      {/* Hole label */}
      <text x={10} y={18} fontSize={10} fill="#8E8E93">#{hole.number}</text>
      <text x={W - 10} y={18} textAnchor="end" fontSize={10} fill="#C4762A" fontWeight="700">
        Par {hole.par}
      </text>
    </svg>
  );
}

// ─── Club Chip ────────────────────────────────────────────────────────────────

function ClubChip({ club, highlighted }: { club: ClubEntry; highlighted: boolean }) {
  return (
    <div style={{
      padding: "6px 12px",
      borderRadius: 20,
      background: highlighted ? "var(--grad-copper, linear-gradient(135deg,#D48B3A,#C4762A,#8B4E1A))" : "#2C2C2E",
      border: highlighted ? "none" : "1px solid #3A3A3C",
      color: highlighted ? "#FFF" : "#8E8E93",
      fontSize: 13,
      fontWeight: highlighted ? 700 : 400,
      fontFamily: "'Oswald', sans-serif",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>
      {club.slot} <span style={{ opacity: 0.7, fontSize: 11 }}>{club.distanceYds}y</span>
    </div>
  );
}

// ─── Strategy Tab ────────────────────────────────────────────────────────────

interface StrategyTabProps {
  holeNumber: number;
  holePar: number;
  holeYds: number;
  course: CourseStrategyDoc;
  windMph: number;
  windToPin: boolean;
}

function StrategyTab({ holeNumber, holePar, holeYds, course, windMph, windToPin }: StrategyTabProps) {
  const s = course.holes.find(h => h.hole === holeNumber);
  const isBirdieHole = course.birdieWindows.includes(holeNumber);
  const isDefendHole = course.parDefendHoles.includes(holeNumber);

  const cardStyle: React.CSSProperties = {
    background: "#1C1C1E", borderRadius: 14, padding: "13px 15px", marginBottom: 0,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em",
    marginBottom: 8, fontFamily: "'Oswald',sans-serif",
  };
  const bodyStyle: React.CSSProperties = {
    color: "#F5F5F7", fontSize: 13, lineHeight: 1.6,
  };

  if (!s) {
    return (
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#8E8E93" }}>Course Strategy</div>
        <div style={{ color: "#8E8E93", fontSize: 13 }}>
          Strategy not yet loaded for {course.courseName} Hole {holeNumber}.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hole header badge */}
      <div style={{ ...cardStyle, border: "1px solid #C4762A40", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ ...labelStyle, color: "#C4762A" }}>{course.courseName}</div>
          <div style={{ color: "#F5F5F7", fontSize: 15, fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>
            Hole {s.hole} · Par {s.par} · {s.yds} yds · HDCP {s.hdcp}
          </div>
        </div>
        <div style={{
          background: isBirdieHole ? "#3DAA4525" : isDefendHole ? "#E0555520" : "#2C2C2E",
          border: `1px solid ${isBirdieHole ? "#3DAA45" : isDefendHole ? "#E05555" : "#3A3A3C"}`,
          borderRadius: 10, padding: "4px 10px",
          color: isBirdieHole ? "#3DAA45" : isDefendHole ? "#E05555" : "#8E8E93",
          fontSize: 11, fontWeight: 700,
        }}>
          {isBirdieHole ? "🟢 BIRDIE" : isDefendHole ? "🔴 DEFEND" : "⚪ PAR"}
        </div>
      </div>

      {/* Aim + ideal play */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#C4762A" }}>🎯 Aim Point</div>
        <div style={bodyStyle}>{s.aim}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#D4C44A" }}>⛳ Ideal Play</div>
        <div style={bodyStyle}>{s.ideal}</div>
        <div style={{ marginTop: 8, padding: "6px 10px", background: "#2C2C2E", borderRadius: 8, color: "#C4762A", fontSize: 12 }}>
          🥏 Wedge guide: {s.wedge}
        </div>
      </div>

      {/* Hazards */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#E05555" }}>⚠️ Hazards</div>
        <div style={bodyStyle}>{s.hazards}</div>
      </div>

      {/* GO / NO-GO — only for holes that have them */}
      {(s.go || s.noGo) && (
        <div style={{ display: "flex", gap: 10 }}>
          {s.go && (
            <div style={{ ...cardStyle, flex: 1, border: "1px solid #3DAA4540" }}>
              <div style={{ ...labelStyle, color: "#3DAA45" }}>✅ GO IF</div>
              <div style={{ ...bodyStyle, fontSize: 12 }}>{s.go}</div>
            </div>
          )}
          {s.noGo && (
            <div style={{ ...cardStyle, flex: 1, border: "1px solid #E0555540" }}>
              <div style={{ ...labelStyle, color: "#E05555" }}>🚫 NO-GO IF</div>
              <div style={{ ...bodyStyle, fontSize: 12 }}>{s.noGo}</div>
            </div>
          )}
        </div>
      )}

      {/* Features note */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#8E8E93" }}>📋 Hole Notes</div>
        <div style={{ ...bodyStyle, color: "#AEAEB2", fontSize: 12 }}>{s.features}</div>
      </div>

      {/* Your averages */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#8E8E93" }}>Your Stats (18Birdies)</div>
        {[
          { label: `Par ${holePar} avg`, val: holePar === 3 ? MY_STATS.par3Avg : holePar === 4 ? MY_STATS.par4Avg : MY_STATS.par5Avg },
          { label: "GIR %", val: `${MY_STATS.girPct}%` },
          { label: "Fairways hit", val: `${MY_STATS.fairwaysHitPct}%` },
          { label: "HCP", val: MY_STATS.handicap },
        ].map(({ label, val }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "5px 0", borderBottom: "1px solid #2C2C2E",
          }}>
            <div style={{ color: "#8E8E93", fontSize: 13 }}>{label}</div>
            <div style={{ color: "#F5F5F7", fontSize: 13, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Wind note reminder */}
      {windMph > 3 && (
        <div style={{ ...cardStyle, background: "#1C1C1E", border: "1px solid #D4C44A40" }}>
          <div style={{ ...labelStyle, color: "#D4C44A" }}>💨 Wind Adjustment Active</div>
          <div style={{ ...bodyStyle, fontSize: 12 }}>
            {windMph} mph {windToPin ? "headwind" : "tailwind"} — course has no trees, use{" "}
            {windToPin ? "1 extra club" : "½ club less"}. Verify flag before shot.
          </div>
        </div>
      )}

      {/* Key principles (collapsed under course notes) */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#8E8E93" }}>📐 {course.courseName} Principles</div>
        {course.keyPrinciples.map((p, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, padding: "5px 0",
            borderBottom: i < course.keyPrinciples.length - 1 ? "1px solid #2C2C2E" : "none",
          }}>
            <div style={{ color: "#C4762A", fontSize: 11, marginTop: 2, flexShrink: 0 }}>{i + 1}.</div>
            <div style={{ color: "#AEAEB2", fontSize: 12, lineHeight: 1.5 }}>{p}</div>
          </div>
        ))}
      </div>

      {/* Pre-round checklist (shown as reminder) */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: "#8E8E93" }}>✅ Pre-Round Checklist</div>
        {course.preRoundChecklist.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0",
            borderBottom: i < course.preRoundChecklist.length - 1 ? "1px solid #2C2C2E" : "none",
          }}>
            <div style={{ color: "#3DAA45", fontSize: 10, marginTop: 3, flexShrink: 0 }}>▸</div>
            <div style={{ color: "#AEAEB2", fontSize: 12 }}>{item}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CaddieModeProps {
  onClose: () => void;
  currentHole?: Partial<HoleData>;
}

export function CaddieMode({ onClose, currentHole }: CaddieModeProps) {
  const hole: HoleData = { ...DEMO_HOLE, ...(currentHole ?? {}) };

  // GPS state
  const [gpsPos, setGpsPos]         = useState<LatLon | null>(null);
  const [gpsError, setGpsError]     = useState<string | null>(null);
  const [distToPin, setDistToPin]   = useState<number>(hole.yardage.white / 2); // start mid-hole
  const [distFromTee, setDistFromTee] = useState<number>(hole.yardage.white / 2);
  const watchRef = useRef<number | null>(null);

  // Wind state
  const [wind, setWind] = useState<WindData>({ speedMph: 0, directionDeg: 0, source: "api" });
  const [windToPin, setWindToPin]   = useState(true);

  // UI state
  const [activeTab, setActiveTab]   = useState<"map" | "clubs" | "strategy">("map");
  const [showWindEdit, setShowWindEdit] = useState(false);

  // Club rec
  const rec = recommendClub(distToPin, wind.speedMph, windToPin);

  // GPS watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS not available on this device");
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setGpsPos(coords);
        if (hole.pinLatLon) {
          const d = haversineYards(coords, hole.pinLatLon);
          setDistToPin(Math.round(d));
        }
        if (hole.teeLatLon) {
          const d = haversineYards(hole.teeLatLon, coords);
          setDistFromTee(Math.round(d));
        }
      },
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [hole]);

  // Weather fetch
  useEffect(() => {
    if (!gpsPos) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${gpsPos.lat}&longitude=${gpsPos.lon}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=mph`)
      .then(r => r.json())
      .then(d => {
        if (d.current) {
          setWind({
            speedMph: Math.round(d.current.wind_speed_10m),
            directionDeg: d.current.wind_direction_10m,
            gust: d.current.wind_gusts_10m ? Math.round(d.current.wind_gusts_10m) : undefined,
            source: "api",
          });
        }
      })
      .catch(() => {/* keep last wind */});
  }, [gpsPos]);

  const handleDistSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = Number(e.target.value);
    setDistToPin(d);
    setDistFromTee(hole.yardage.white - d);
  };

  // Nearby clubs (within 20 yds of rec)
  const altClubs = MY_BAG.filter(
    c => c.distanceYds > 0 &&
         Math.abs(c.distanceYds - rec.adjustedTarget) <= 30 &&
         c.slot !== rec.club.slot
  ).slice(0, 3);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#101012",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif",
      userSelect: "none",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 8px",
        background: "linear-gradient(180deg,#1E1E20 0%,#101012 100%)",
        borderBottom: "1px solid #2C2C2E",
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#8E8E93",
          fontSize: 22, cursor: "pointer", padding: "4px 8px",
        }}>‹</button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 18, fontWeight: 700, letterSpacing: "0.08em",
            background: "linear-gradient(135deg,#D48B3A 0%,#C4762A 50%,#8B4E1A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>CADDIE MODE</div>
          <div style={{ color: "#8E8E93", fontSize: 11 }}>
            Hole {hole.number} · Par {hole.par} · {hole.yardage.white}y
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: gpsPos ? "#3DAA45" : gpsError ? "#E05555" : "#D4C44A",
            boxShadow: gpsPos ? "0 0 6px #3DAA45" : "none",
          }} />
          <div style={{ color: "#48484A", fontSize: 9 }}>{gpsPos ? "GPS ✓" : gpsError ? "No GPS" : "Locating…"}</div>
        </div>
      </div>

      {/* ── Distance hero ── */}
      <div style={{
        padding: "16px 20px 12px",
        background: "#18181A",
        borderBottom: "1px solid #2C2C2E",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* To pin */}
          <div>
            <div style={{ color: "#8E8E93", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>To Pin</div>
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 56, fontWeight: 700, lineHeight: 1,
              color: distanceColor(distToPin),
              textShadow: `0 0 20px ${distanceColor(distToPin)}40`,
            }}>
              {Math.round(distToPin)}
            </div>
            <div style={{ color: "#8E8E93", fontSize: 12 }}>yards</div>
          </div>

          {/* Wind */}
          <button
            onClick={() => setShowWindEdit(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <WindCompass wind={wind} />
          </button>

          {/* Front/Back */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#8E8E93", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Frnt / Back</div>
            <div style={{ color: "#F5F5F7", fontSize: 20, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>
              {Math.max(0, Math.round(distToPin - 18))}
            </div>
            <div style={{ color: "#8E8E93", fontSize: 16, fontFamily: "'Oswald',sans-serif" }}>
              {Math.round(distToPin + 18)}
            </div>
          </div>
        </div>

        {/* Distance slider (manual override when no GPS pin data) */}
        {!hole.pinLatLon && (
          <div style={{ marginTop: 10 }}>
            <input type="range"
              min={0} max={hole.yardage.white}
              value={distToPin}
              onChange={handleDistSlide}
              style={{ width: "100%", accentColor: "#C4762A" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#48484A", fontSize: 10 }}>
              <span>0</span><span style={{ color: "#8E8E93" }}>Slide to set distance</span><span>{hole.yardage.white}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Wind manual edit ── */}
      {showWindEdit && (
        <div style={{
          background: "#1C1C1E", borderBottom: "1px solid #2C2C2E",
          padding: "10px 16px", flexShrink: 0,
        }}>
          <div style={{ color: "#8E8E93", fontSize: 11, marginBottom: 6 }}>Manual wind override</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#48484A", fontSize: 10 }}>Speed (mph)</div>
              <input type="range" min={0} max={40} value={wind.speedMph}
                onChange={e => setWind(w => ({ ...w, speedMph: Number(e.target.value), source: "manual" }))}
                style={{ width: "100%", accentColor: "#C4762A" }} />
              <div style={{ color: "#F5F5F7", fontSize: 13, textAlign: "center" }}>{wind.speedMph}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#48484A", fontSize: 10 }}>Direction</div>
              <input type="range" min={0} max={359} value={wind.directionDeg}
                onChange={e => setWind(w => ({ ...w, directionDeg: Number(e.target.value), source: "manual" }))}
                style={{ width: "100%", accentColor: "#C4762A" }} />
              <div style={{ color: "#F5F5F7", fontSize: 13, textAlign: "center" }}>{compassLabel(wind.directionDeg)}</div>
            </div>
            <div>
              <div style={{ color: "#48484A", fontSize: 10, marginBottom: 4 }}>Dir</div>
              <button
                onClick={() => setWindToPin(v => !v)}
                style={{
                  padding: "6px 10px", borderRadius: 8, fontSize: 11,
                  background: windToPin ? "#C4762A" : "#2C2C2E",
                  border: "1px solid #3A3A3C", color: "#F5F5F7", cursor: "pointer",
                }}
              >
                {windToPin ? "🌬 Into" : "🌬 With"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #2C2C2E",
        flexShrink: 0, background: "#18181A",
      }}>
        {(["map", "clubs", "strategy"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "10px 0",
            background: "none", border: "none",
            color: activeTab === tab ? "#C4762A" : "#8E8E93",
            fontSize: 12, fontWeight: activeTab === tab ? 700 : 400,
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderBottom: activeTab === tab ? "2px solid #C4762A" : "2px solid transparent",
            cursor: "pointer",
          }}>
            {tab === "map" ? "⬜ Map" : tab === "clubs" ? "🏌 Clubs" : "🎯 Strategy"}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* MAP TAB */}
        {activeTab === "map" && (
          <>
            {/* Club recommendation card */}
            <div style={{
              background: "#1C1C1E", borderRadius: 14,
              border: "1px solid #C4762A40",
              padding: "14px 16px",
            }}>
              <div style={{ color: "#8E8E93", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Recommended Club
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 32, fontWeight: 700,
                    background: "linear-gradient(135deg,#D48B3A,#C4762A,#8B4E1A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{rec.club.slot}</div>
                  <div style={{ color: "#8E8E93", fontSize: 11 }}>
                    {rec.club.brand} {rec.club.model}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#F5F5F7", fontSize: 22, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>
                    {rec.club.distanceYds}y
                  </div>
                  <div style={{ color: "#8E8E93", fontSize: 11 }}>avg distance</div>
                </div>
              </div>
              {rec.note && (
                <div style={{
                  marginTop: 8, padding: "6px 10px", borderRadius: 8,
                  background: "#252525", color: "#D4C44A", fontSize: 12,
                }}>
                  ⚡ {rec.note}
                </div>
              )}
            </div>

            {/* Hole map */}
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#1A1A1C" }}>
              <div style={{ padding: "10px 14px 6px", background: "#1C1C1E", display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: "#8E8E93", fontSize: 11 }}>Course Layout</div>
                <div style={{ color: "#C4762A", fontSize: 11, fontFamily: "'Oswald',sans-serif" }}>
                  HCP {hole.handicap}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                <HoleMap hole={hole} playerDistFromPin={distToPin} playerDistFromTee={distFromTee} />
              </div>
              {/* Hazard legend */}
              <div style={{ padding: "8px 14px 12px", display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { color: "#C8B96A", label: "Bunker" },
                  { color: "#1A5CA8", label: "Water" },
                  { color: "#1A4020", label: "Trees" },
                  { color: "#C4762A", label: "Layup" },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    <div style={{ color: "#8E8E93", fontSize: 10 }}>{l.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby hazards */}
            <div style={{ background: "#1C1C1E", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ color: "#8E8E93", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Hazards Near You
              </div>
              {hole.hazards
                .filter(h => Math.abs(h.center[1] - distFromTee) < 80)
                .map((h, i) => {
                  const ydsAway = Math.round(Math.abs(h.center[1] - distFromTee));
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "7px 0",
                      borderBottom: i < hole.hazards.length - 1 ? "1px solid #2C2C2E" : "none",
                    }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                          background: h.type === "water" ? "#1A3D6B" : h.type === "bunker" ? "#3D3420" : "#1A2E1A",
                          fontSize: 14,
                        }}>
                          {h.type === "water" ? "💧" : h.type === "bunker" ? "🏖" : "🌲"}
                        </div>
                        <div>
                          <div style={{ color: "#F5F5F7", fontSize: 13 }}>{h.label}</div>
                          <div style={{ color: "#8E8E93", fontSize: 11 }}>
                            {h.center[0] < 0 ? "Left" : "Right"} ·&nbsp;
                            {h.center[1] > distFromTee ? "ahead" : "behind"}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: ydsAway < 20 ? "#E05555" : "#D4C44A", fontSize: 16, fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>
                          {ydsAway}y
                        </div>
                        <div style={{ color: "#48484A", fontSize: 10 }}>away</div>
                      </div>
                    </div>
                  );
                })}
              {hole.hazards.filter(h => Math.abs(h.center[1] - distFromTee) < 80).length === 0 && (
                <div style={{ color: "#48484A", fontSize: 12, textAlign: "center", padding: "8px 0" }}>
                  No hazards in immediate range
                </div>
              )}
            </div>
          </>
        )}

        {/* CLUBS TAB */}
        {activeTab === "clubs" && (
          <>
            <div style={{ background: "#1C1C1E", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ color: "#8E8E93", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Best Options · {Math.round(distToPin)}y to pin
                {wind.speedMph > 2 && <span style={{ color: "#C4762A" }}> · {wind.speedMph}mph {windToPin ? "head" : "tail"}wind</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <ClubChip club={rec.club} highlighted />
                {altClubs.map(c => <ClubChip key={c.slot} club={c} highlighted={false} />)}
              </div>
            </div>

            {/* Full bag distance chart */}
            <div style={{ background: "#1C1C1E", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ color: "#8E8E93", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Bag
              </div>
              {MY_BAG.filter(c => c.distanceYds > 0).map((club, i) => {
                const isRec = club.slot === rec.club.slot;
                const pct = (club.distanceYds / 300) * 100;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "6px 0",
                    borderBottom: i < MY_BAG.length - 2 ? "1px solid #2C2C2E" : "none",
                  }}>
                    <div style={{
                      width: 56, color: isRec ? "#C4762A" : "#8E8E93",
                      fontSize: 13, fontFamily: "'Oswald',sans-serif",
                      fontWeight: isRec ? 700 : 400,
                    }}>{club.slot}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: 6, borderRadius: 3,
                        background: "#2C2C2E",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: isRec
                            ? "linear-gradient(90deg,#C4762A,#D48B3A)"
                            : distanceColor(Math.abs(club.distanceYds - distToPin)),
                          borderRadius: 3,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                    </div>
                    <div style={{
                      width: 44, textAlign: "right",
                      color: isRec ? "#E0A550" : "#F5F5F7",
                      fontSize: 14, fontFamily: "'Oswald',sans-serif",
                      fontWeight: isRec ? 700 : 400,
                    }}>{club.distanceYds}y</div>
                    <div style={{
                      width: 36, textAlign: "right",
                      color: "#48484A", fontSize: 11,
                    }}>
                      {club.distanceYds > distToPin
                        ? <span style={{ color: "#3DAA45" }}>+{club.distanceYds - distToPin}</span>
                        : <span style={{ color: "#E05555" }}>{club.distanceYds - distToPin}</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* STRATEGY TAB */}
        {activeTab === "strategy" && (
          <StrategyTab
            holeNumber={hole.number}
            holePar={hole.par}
            holeYds={hole.yardage.white}
            course={CALUSA_CC}
            windMph={wind.speedMph}
            windToPin={windToPin}
          />
        )}
      </div>
    </div>
  );
}
