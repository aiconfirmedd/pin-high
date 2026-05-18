import type { Hole } from "../types";

export function scoreToPar(score: number | "", par: number | ""): number | null {
  if (score === "" || par === "") return null;
  return score - par;
}

export function getScoreLabel(diff: number | null): string {
  if (diff === null) return "";
  if (diff <= -3) return "−3";
  if (diff === -2) return "−2";
  if (diff === -1) return "−1";
  if (diff === 0) return "E";
  if (diff === 1) return "+1";
  if (diff === 2) return "+2";
  return "+3+";
}

export function getScoringSymbolClass(diff: number | null): string {
  if (diff === null) return "";
  if (diff <= -3) return "sym-albatross";
  if (diff === -2) return "sym-eagle";
  if (diff === -1) return "sym-birdie";
  if (diff === 0) return "sym-par";
  if (diff === 1) return "sym-bogey";
  if (diff === 2) return "sym-double";
  return "sym-triple";
}

export type Totals = {
  yards: number;
  par: number;
  score: number;
  putts: number;
  firHit: number;
  firAtt: number;
  girHit: number;
  girAtt: number;
  udMade: number;
  udAtt: number;
  ssMade: number;
  ssAtt: number;
};

export function calcTotals(holes: Hole[]): Totals {
  const totals: Totals = {
    yards: 0,
    par: 0,
    score: 0,
    putts: 0,
    firHit: 0,
    firAtt: 0,
    girHit: 0,
    girAtt: 0,
    udMade: 0,
    udAtt: 0,
    ssMade: 0,
    ssAtt: 0,
  };

  for (const h of holes) {
    if (h.yards !== "") totals.yards += h.yards;
    if (h.par !== "") totals.par += h.par;
    if (h.score !== "") totals.score += h.score;
    if (h.putts !== "") totals.putts += h.putts;

    // FIR: only applicable on par 4 and 5
    if (h.par !== "" && h.par >= 4) {
      if (h.fir === "hit") { totals.firHit++; totals.firAtt++; }
      else if (h.fir === "miss") { totals.firAtt++; }
      // "na" and "" don't count
    }

    // GIR
    if (h.gir === "hit") { totals.girHit++; totals.girAtt++; }
    else if (h.gir === "miss") { totals.girAtt++; }

    // U/D
    if (h.upDown === "made") { totals.udMade++; totals.udAtt++; }
    else if (h.upDown === "missed") { totals.udAtt++; }

    // Sand Save
    if (h.sandSave === "made") { totals.ssMade++; totals.ssAtt++; }
    else if (h.sandSave === "missed") { totals.ssAtt++; }
  }

  return totals;
}

export function formatPct(made: number, att: number): string {
  if (att === 0) return "—";
  return `${Math.round((made / att) * 100)}%`;
}

export function cumulativeToPar(holes: Hole[]): number {
  let total = 0;
  for (const h of holes) {
    if (h.score !== "" && h.par !== "") {
      total += h.score - h.par;
    }
  }
  return total;
}
