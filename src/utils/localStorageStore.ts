import type { Round, CoursePreset, Club, RoundReflection } from "../types";

export function saveRound(round: Round): void {
  try {
    const rounds = loadRounds();
    const idx = rounds.findIndex(r => r.id === round.id);
    if (idx >= 0) {
      rounds[idx] = round;
    } else {
      rounds.push(round);
    }
    localStorage.setItem("golf_rounds", JSON.stringify(rounds));
  } catch {
    // ignore
  }
}

export function loadRounds(): Round[] {
  try {
    const raw = localStorage.getItem("golf_rounds");
    if (!raw) return [];
    return JSON.parse(raw) as Round[];
  } catch {
    return [];
  }
}

export function savePreset(preset: CoursePreset): void {
  try {
    const presets = loadPresets();
    const idx = presets.findIndex(p => p.id === preset.id);
    if (idx >= 0) {
      presets[idx] = preset;
    } else {
      presets.push(preset);
    }
    localStorage.setItem("golf_presets", JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function loadPresets(): CoursePreset[] {
  try {
    const raw = localStorage.getItem("golf_presets");
    if (!raw) return [];
    return JSON.parse(raw) as CoursePreset[];
  } catch {
    return [];
  }
}

export function deletePreset(id: string): void {
  try {
    const presets = loadPresets().filter(p => p.id !== id);
    localStorage.setItem("golf_presets", JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function saveClubs(clubs: Club[]): void {
  try {
    localStorage.setItem("golf_clubs", JSON.stringify(clubs));
  } catch {
    // ignore
  }
}

export function loadClubs(): Club[] {
  try {
    const raw = localStorage.getItem("golf_clubs");
    if (!raw) return [];
    return JSON.parse(raw) as Club[];
  } catch {
    return [];
  }
}

export function saveReflection(r: RoundReflection): void {
  try {
    const all = loadReflections();
    const idx = all.findIndex(x => x.roundId === r.roundId);
    if (idx >= 0) {
      all[idx] = r;
    } else {
      all.push(r);
    }
    localStorage.setItem("golf_reflections", JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function loadReflections(): RoundReflection[] {
  try {
    const raw = localStorage.getItem("golf_reflections");
    if (!raw) return [];
    return JSON.parse(raw) as RoundReflection[];
  } catch {
    return [];
  }
}
