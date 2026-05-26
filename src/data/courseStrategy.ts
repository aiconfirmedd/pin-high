// src/data/courseStrategy.ts
// Course registry + shared types.
// Each course lives in its own folder under src/data/courses/<course-id>/index.ts.

import { CALUSA_CC } from "./courses/calusa-cc";
import { HERITAGE_ISLES } from "./courses/heritage-isles";

export interface HoleStrategy {
  hole: number;
  par: number;
  yds: number;
  hdcp: number;
  target: "Par" | "Birdie" | "Eagle Look" | "Par/Birdie";
  features: string;
  hazards: string;
  aim: string;
  ideal: string;
  wedge: string;
  go?: string;
  noGo?: string;
}

export interface CourseStrategyDoc {
  courseId: string;
  courseName: string;
  location: string;
  designer: string;
  par: number;
  yds: number;
  tee: string;
  slope: number;
  rating: number;
  opened: string;
  courseNotes: string[];
  keyPrinciples: string[];
  roundTargets: { tier: string; front: string; back: string; total: string; notes: string }[];
  birdieWindows: number[];
  parDefendHoles: number[];
  preRoundChecklist: string[];
  holes: HoleStrategy[];
}

export { CALUSA_CC, HERITAGE_ISLES };

export const COURSES_BY_ID: Record<string, CourseStrategyDoc> = {
  "calusa-cc": CALUSA_CC,
  "heritage-isles": HERITAGE_ISLES,
};

export const ALL_COURSES = Object.values(COURSES_BY_ID);

/** Get strategy for a specific hole number (1-18). */
export function getHoleStrategy(courseId: string, hole: number): HoleStrategy | null {
  const course = COURSES_BY_ID[courseId];
  if (!course) return null;
  return course.holes.find((item) => item.hole === hole) ?? null;
}

/** Look up a course by ID. */
export function getCourse(courseId: string): CourseStrategyDoc | null {
  return COURSES_BY_ID[courseId] ?? null;
}
