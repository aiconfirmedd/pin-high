import type { Hole } from "../types";

export type StrokeLossCategory = {
  label: string;
  strokes: number;
};

export type RoundAnalysis = {
  totalScore: number;
  totalPar: number;
  toPar: number;
  birdies: number;
  eagles: number;
  albatrosses: number;
  pars: number;
  bogeys: number;
  doubles: number;
  tripleOrWorse: number;
  firPct: number;
  firHit: number;
  firAtt: number;
  girPct: number;
  girHit: number;
  girAtt: number;
  avgPutts: number;
  totalPutts: number;
  udPct: number;
  udMade: number;
  udAtt: number;
  ssPct: number;
  ssMade: number;
  ssAtt: number;
  strokeLoss: StrokeLossCategory[];
  priorityList: string[];
  front9: { score: number; par: number };
  back9: { score: number; par: number };
};

export function analyzeRound(holes: Hole[]): RoundAnalysis {
  let totalScore = 0;
  let totalPar = 0;
  let birdies = 0;
  let eagles = 0;
  let albatrosses = 0;
  let pars = 0;
  let bogeys = 0;
  let doubles = 0;
  let tripleOrWorse = 0;

  let firHit = 0;
  let firAtt = 0;
  let girHit = 0;
  let girAtt = 0;
  let totalPutts = 0;
  let puttsCount = 0;
  let udMade = 0;
  let udAtt = 0;
  let ssMade = 0;
  let ssAtt = 0;

  let front9Score = 0;
  let front9Par = 0;
  let back9Score = 0;
  let back9Par = 0;

  for (const h of holes) {
    const isFront = h.number <= 9;
    if (h.score !== "" && h.par !== "") {
      totalScore += h.score;
      totalPar += h.par;
      if (isFront) {
        front9Score += h.score;
        front9Par += h.par;
      } else {
        back9Score += h.score;
        back9Par += h.par;
      }
      const diff = h.score - h.par;
      if (diff <= -3) albatrosses++;
      else if (diff === -2) eagles++;
      else if (diff === -1) birdies++;
      else if (diff === 0) pars++;
      else if (diff === 1) bogeys++;
      else if (diff === 2) doubles++;
      else tripleOrWorse++;
    }

    if (h.par !== "" && h.par >= 4) {
      if (h.fir === "hit") { firHit++; firAtt++; }
      else if (h.fir === "miss") { firAtt++; }
    }

    if (h.gir === "hit") { girHit++; girAtt++; }
    else if (h.gir === "miss") { girAtt++; }

    if (h.putts !== "") {
      totalPutts += h.putts;
      puttsCount++;
    }

    if (h.upDown === "made") { udMade++; udAtt++; }
    else if (h.upDown === "missed") { udAtt++; }

    if (h.sandSave === "made") { ssMade++; ssAtt++; }
    else if (h.sandSave === "missed") { ssAtt++; }
  }

  const toPar = totalScore - totalPar;
  const avgPutts = puttsCount > 0 ? totalPutts / puttsCount : 0;
  const firPct = firAtt > 0 ? (firHit / firAtt) * 100 : 0;
  const girPct = girAtt > 0 ? (girHit / girAtt) * 100 : 0;
  const udPct = udAtt > 0 ? (udMade / udAtt) * 100 : 0;
  const ssPct = ssAtt > 0 ? (ssMade / ssAtt) * 100 : 0;

  // Stroke loss calculation
  let puttingLoss = 0;
  let shortGameLoss = 0;
  let approachLoss = 0;
  let teeShortLoss = 0;
  let bunkerLoss = 0;

  for (const h of holes) {
    // Putting loss: GIR + 3+ putts
    if (h.gir === "hit" && h.putts !== "" && h.putts >= 3) {
      puttingLoss += h.putts - 2;
    }

    // Short game loss: missed GIR + failed U/D
    if (h.gir === "miss" && h.upDown === "missed" && h.score !== "" && h.par !== "") {
      shortGameLoss += Math.max(0, h.score - h.par);
    }

    // Approach/GIR: missed green
    if (h.gir === "miss") {
      approachLoss++;
    }

    // Tee shot: missed fairway
    if (h.fir === "miss") {
      teeShortLoss++;
    }

    // Bunker: missed sand save
    if (h.sandSave === "missed") {
      bunkerLoss++;
    }
  }

  // Untracked: remaining strokes above par not accounted for
  const tracked = puttingLoss + shortGameLoss + Math.max(0, approachLoss - girAtt + girHit) + teeShortLoss + bunkerLoss;
  const untracked = Math.max(0, toPar - tracked);

  const strokeLoss: StrokeLossCategory[] = [
    { label: "Putting (GIR + 3+ putts)", strokes: puttingLoss },
    { label: "Short game (GIR miss + U/D fail)", strokes: shortGameLoss },
    { label: "Approach / GIR (missed greens)", strokes: approachLoss },
    { label: "Tee shot (fairways missed)", strokes: teeShortLoss },
    { label: "Bunker", strokes: bunkerLoss },
    { label: "Untracked", strokes: untracked },
  ].filter(c => c.strokes > 0).sort((a, b) => b.strokes - a.strokes);

  const priorityList = strokeLoss.slice(0, 3).map(c => {
    if (c.label.includes("Putting")) return "Work on lag putting to reduce 3-putt frequency";
    if (c.label.includes("Short game")) return "Improve up-and-down conversion from off the green";
    if (c.label.includes("Approach")) return "Focus on approach accuracy to hit more greens in regulation";
    if (c.label.includes("Tee shot")) return "Improve fairway hit rate off the tee";
    if (c.label.includes("Bunker")) return "Practice bunker play to improve sand save rate";
    return "Track more stats to identify additional improvement areas";
  });

  return {
    totalScore,
    totalPar,
    toPar,
    birdies,
    eagles,
    albatrosses,
    pars,
    bogeys,
    doubles,
    tripleOrWorse,
    firPct,
    firHit,
    firAtt,
    girPct,
    girHit,
    girAtt,
    avgPutts,
    totalPutts,
    udPct,
    udMade,
    udAtt,
    ssPct,
    ssMade,
    ssAtt,
    strokeLoss,
    priorityList,
    front9: { score: front9Score, par: front9Par },
    back9: { score: back9Score, par: back9Par },
  };
}
