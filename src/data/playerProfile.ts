// src/data/playerProfile.ts
// Player profile seeded from 18Birdies — Terrell Pittinger
// Imported: 2026-05-24 | True Distance GPS measurements

export interface ClubEntry {
  slot: string;          // display name
  brand: string;
  model: string;
  distanceYds: number;   // GPS true distance average
  loft?: number;         // degrees, if applicable
}

export interface PlayerStats {
  handicap: number;
  avgScore: number;
  roundsPlayed: number;
  coursesPlayed: number;
  parOrBetterPerRound: number;
  doubleOrWorsePerRound: number;
  par3Avg: number;
  par4Avg: number;
  par5Avg: number;
  fairwaysHitPct: number;
  girPct: number;
  scoringGoal: string;
  homeCourse: string;
  importedFrom: string;
  importedAt: string;
}

/** Complete bag — GPS true distances from 18Birdies, 18 holes / all rounds */
export const MY_BAG: ClubEntry[] = [
  { slot: "Driver",    brand: "Titleist",   model: "GT2 Driver",    distanceYds: 288 },
  { slot: "3 Wood",    brand: "TaylorMade", model: "Qi35",          distanceYds: 249 },
  { slot: "7 Wood",    brand: "TaylorMade", model: "Qi10 Fairway",  distanceYds: 253 },
  { slot: "4 Iron",    brand: "TaylorMade", model: "P790 2023",     distanceYds: 215 },
  { slot: "5 Iron",    brand: "TaylorMade", model: "P770 2023",     distanceYds: 205 },
  { slot: "6 Iron",    brand: "TaylorMade", model: "P770 2023",     distanceYds: 190 },
  { slot: "7 Iron",    brand: "TaylorMade", model: "P770 2023",     distanceYds: 177 },
  { slot: "8 Iron",    brand: "TaylorMade", model: "P770 2023",     distanceYds: 160 },
  { slot: "9 Iron",    brand: "TaylorMade", model: "P770 2023",     distanceYds: 151 },
  { slot: "PW (50°)",  brand: "TaylorMade", model: "MG4",           distanceYds: 115, loft: 50 },
  { slot: "GW (54°)",  brand: "Vokey",      model: "SM11",          distanceYds: 80,  loft: 54 },
  { slot: "GW (58°)",  brand: "Vokey",      model: "SM11",          distanceYds: 60,  loft: 58 },
  { slot: "Putter",    brand: "Scotty Cameron", model: "Fast Back OC", distanceYds: 0 },
];

export const MY_STATS: PlayerStats = {
  handicap: 12.2,
  avgScore: 89.7,
  roundsPlayed: 166,
  coursesPlayed: 39,
  parOrBetterPerRound: 5.5,
  doubleOrWorsePerRound: 5.3,
  par3Avg: 4.0,
  par4Avg: 5.2,
  par5Avg: 5.9,
  fairwaysHitPct: 49.5,
  girPct: 29.5,
  scoringGoal: "Break 80",
  homeCourse: "TPC Tampa Bay",
  importedFrom: "18Birdies",
  importedAt: "2026-05-24",
};

/**
 * Given a target yardage, return the best club recommendation.
 * Accounts for wind if provided (positive = headwind, negative = tailwind).
 */
export function recommendClub(
  targetYds: number,
  windMph: number = 0,
  windTowardPin: boolean = true
): { club: ClubEntry; adjustedTarget: number; note: string } {
  // Rule of thumb: ~1 yd per mph headwind, ~0.7 yd per mph tailwind
  const windAdjustment = windTowardPin
    ? Math.round(windMph * 1.0)
    : -Math.round(windMph * 0.7);

  const adjustedTarget = targetYds + windAdjustment;

  // Filter clubs with a real distance (exclude putter)
  const hittableClubs = MY_BAG.filter(c => c.distanceYds > 0);

  // Find the club whose distance is closest to adjusted target (favor going over)
  const sorted = [...hittableClubs].sort((a, b) => {
    const aDiff = a.distanceYds - adjustedTarget;
    const bDiff = b.distanceYds - adjustedTarget;
    // Prefer club that covers the distance (positive diff ok), penalize coming up short
    const aScore = aDiff >= 0 ? aDiff : Math.abs(aDiff) * 2;
    const bScore = bDiff >= 0 ? bDiff : Math.abs(bDiff) * 2;
    return aScore - bScore;
  });

  const best = sorted[0];
  const diff = best.distanceYds - adjustedTarget;

  let note = "";
  if (windMph > 3 && windTowardPin) {
    note = `${windMph} mph headwind — playing ${adjustedTarget} yds`;
  } else if (windMph > 3 && !windTowardPin) {
    note = `${windMph} mph tailwind — playing ${adjustedTarget} yds`;
  }

  if (diff > 15) {
    note += note ? ". " : "";
    note += `${best.slot} is ${diff} yds over — consider choking down`;
  } else if (diff < -5) {
    note += note ? ". " : "";
    note += `${best.slot} is ${Math.abs(diff)} yds short — swing smooth or go up a club`;
  }

  return { club: best, adjustedTarget, note };
}

/**
 * Return all clubs that can cover a given yardage range (for showing options).
 */
export function clubsForRange(minYds: number, maxYds: number): ClubEntry[] {
  return MY_BAG.filter(
    c => c.distanceYds >= minYds && c.distanceYds <= maxYds
  );
}
