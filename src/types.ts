export type HoleFIR = "hit" | "miss" | "na" | "";
export type HoleGIR = "hit" | "miss" | "";
export type HoleUD  = "made" | "missed" | "dash" | "";
export type HoleSS  = "made" | "missed" | "dash" | "";

export type Hole = {
  number: number;
  yards: number | "";
  par: number | "";
  fir: HoleFIR;
  gir: HoleGIR;
  putts: number | "";
  score: number | "";
  upDown: HoleUD;
  sandSave: HoleSS;
};

export type Round = {
  id: string;
  courseName: string;
  teeName: string;
  teeDistance: number | "";
  date: string;
  playerName?: string;
  holes: Hole[];
};

export type CoursePreset = {
  id: string;
  courseName: string;
  teeName: string;
  teeDistance: number | "";
  holes: Pick<Hole, "number" | "yards" | "par">[];
  createdAt: string;
  updatedAt: string;
};

export type ClubStatus = "normal" | "inconsistent" | "reliable" | "needs-distance";

export type Club = {
  id: string;
  name: string;
  spec: string;
  status: ClubStatus;
  mainMiss: string;
  approachDist: number | "";
  carryDist: number | "";
  totalDist: number | "";
  stockDist: number | "";
  partialDist: number | "";
  notes: string;
};

export type ReflectionAnswer = {
  questionId: string;
  selected: string[];
  freeText: string;
};

export type RoundReflection = {
  roundId: string;
  answers: ReflectionAnswer[];
  savedAt: string;
};

export type AppView =
  | "setup"
  | "scorecard"
  | "insight"
  | "reflection"
  | "clubs"
  | "import"
  | "caddie";
