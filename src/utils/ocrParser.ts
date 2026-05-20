export function parseOcrText(rawText: string): {
  yards: (number | "")[];
  pars: (number | "")[];
  confidence: number[];
  courseName?: string;
  courseNameConfidence?: number;
} {
  const yards: (number | "")[] = Array(18).fill("");
  const pars: (number | "")[] = Array(18).fill("");
  const confidence: number[] = Array(18).fill(0);

  const lines = rawText.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

  // Find rows with numbers that look like yardages (50â700) and par values (3,4,5)
  const yardageRows: number[][] = [];
  const parRows: number[][] = [];

  for (const line of lines) {
    const nums = line.match(/\d+/g);
    if (!nums) continue;

    const numArr = nums.map(Number);

    // A yardage row: multiple numbers between 50 and 700
    const yardCandidates = numArr.filter(n => n >= 50 && n <= 700);
    if (yardCandidates.length >= 3) {
      yardageRows.push(numArr);
    }

    // A par row: numbers that are 3, 4, or 5 only
    const parCandidates = numArr.filter(n => n === 3 || n === 4 || n === 5);
    if (parCandidates.length >= 3 && parCandidates.length === numArr.length) {
      parRows.push(numArr);
    }
  }

  // Pick the best yardage row (one with most numbers in range)
  if (yardageRows.length > 0) {
    // Sort by number of valid yardage values
    yardageRows.sort((a, b) => {
      const aCount = a.filter(n => n >= 50 && n <= 700).length;
      const bCount = b.filter(n => n >= 50 && n <= 700).length;
      return bCount - aCount;
    });

    const bestYardRow = yardageRows[0].filter(n => n >= 50 && n <= 700);
    for (let i = 0; i < Math.min(bestYardRow.length, 18); i++) {
      yards[i] = bestYardRow[i];
      confidence[i] = 0.8;
    }
  }

  // Pick par rows
  if (parRows.length > 0) {
    // Find the par row with most values, prefer the longest
    parRows.sort((a, b) => b.length - a.length);
    const bestParRow = parRows[0];
    for (let i = 0; i < Math.min(bestParRow.length, 18); i++) {
      pars[i] = bestParRow[i];
    }
  }

  // --- Course name extraction ---
  // Look for lines near the top of the text that look like a course/club name.
  // Heuristics: line is mostly letters/spaces, not all-caps numbers, length 4â60,
  // appears before the first yardage row, doesn't match known scorecard labels.
  const SKIP_PATTERNS = /^(hole|yards|yardage|par|handicap|hcp|stroke|score|out|in|total|date|player|name|tee|front|back|men|women|red|white|blue|gold|black|green|platinum)$/i;
  const NUMBER_HEAVY = /^[ds-/.]+$/;

  let courseName: string | undefined;
  let courseNameConfidence = 0;

  // Only scan first ~15 lines - course name is always at the top
  const scanLines = lines.slice(0, 15);
  for (const line of scanLines) {
    // Skip lines that are mostly numbers
    if (NUMBER_HEAVY.test(line)) continue;
    // Skip very short or very long lines
    if (line.length < 4 || line.length > 60) continue;
    // Skip common scorecard field labels
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 1 && SKIP_PATTERNS.test(words[0])) continue;
    // Skip lines where every word matches a skip pattern
    if (words.every(w => SKIP_PATTERNS.test(w))) continue;
    // Must have at least some alphabetic characters (>50% of chars)
    const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount / line.length < 0.4) continue;

    // Score this candidate: prefer lines with title-case or mixed case words,
    // words like "Golf", "Club", "Course", "Country", "Links" boost score
    const golfWords = /golf|club|course|country|links|resort|national|municipal|royal|ridge|creek|lake|valley|hills|meadow|park|manor|estate/i;
    let score = 0.5;
    if (golfWords.test(line)) score = 0.9;
    else if (/[A-Z][a-z]/.test(line)) score = 0.7; // title case
    else if (words.length >= 2) score = 0.65;

    if (score > courseNameConfidence) {
      courseName = line;
      courseNameConfidence = score;
    }
  }

  return { yards, pars, confidence, courseName, courseNameConfidence };
}
