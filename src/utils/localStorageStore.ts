import type { Round, CoursePreset, Club, RoundReflection } from "../types";

const USERS_KEY = "pin_high_users";
const SESSION_KEY = "pin_high_session";

export type LocalUser = {
  id: string;
  name: string;
  password: string;
  createdAt: string;
  lastLoginAt: string;
};

export type LocalUserSession = Pick<LocalUser, "id" | "name" | "createdAt" | "lastLoginAt">;

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function loadUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) as LocalUser[] : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function saveSession(user: LocalUser): LocalUserSession {
  const session: LocalUserSession = {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function loadLocalSession(): LocalUserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as LocalUserSession : null;
  } catch {
    return null;
  }
}

export function clearLocalSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function authenticateLocalUser(name: string, password: string): { session: LocalUserSession | null; error: string; created: boolean } {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanPassword = password.trim();

  if (cleanName.length < 2) {
    return { session: null, error: "Enter a name with at least 2 characters.", created: false };
  }

  if (cleanPassword.length < 4) {
    return { session: null, error: "Use a simple password with at least 4 characters.", created: false };
  }

  const users = loadUsers();
  const existingIndex = users.findIndex(user => normalizeName(user.name) === normalizeName(cleanName));
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    if (existing.password !== cleanPassword) {
      return { session: null, error: "That password does not match this name.", created: false };
    }

    const updated = { ...existing, lastLoginAt: now };
    users[existingIndex] = updated;
    saveUsers(users);
    return { session: saveSession(updated), error: "", created: false };
  }

  const user: LocalUser = {
    id: `local-user-${Date.now()}`,
    name: cleanName,
    password: cleanPassword,
    createdAt: now,
    lastLoginAt: now,
  };

  users.push(user);
  saveUsers(users);
  return { session: saveSession(user), error: "", created: true };
}

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
