export function parseOcrText(rawText: string): {
  yards: (number | "")[];
  pars: (number | "")[];
  confidence: number[];
} {
  const yards: (number | "")[] = Array(18).fill("");
  const pars: (number | "")[] = Array(18).fill("");
  const confidence: number[] = Array(18).fill(0);

  const lines = rawText.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

  // Find rows with numbers that look like yardages (50–700) and par values (3,4,5)
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
      // High confidence for par values since they're constrained
      confidence[i] = Math.max(confidence[i], 0.9);
    }
  }

  // Attempt to handle scorecard with OUT/IN sections
  // Look for patterns like: 1 2 3 4 5 6 7 8 9 OUT (front 9) then 10-18 back 9
  const allNumbers: number[][] = [];
  for (const line of lines) {
    const nums = line.match(/\d+/g);
    if (nums) {
      allNumbers.push(nums.map(Number));
    }
  }

  // If we found separate sections, try to merge them
  const front9Yards: number[] = [];
  const back9Yards: number[] = [];

  for (const row of allNumbers) {
    const inRange = row.filter(n => n >= 50 && n <= 700);
    if (inRange.length === 9) {
      if (front9Yards.length === 0) {
        front9Yards.push(...inRange);
      } else if (back9Yards.length === 0) {
        back9Yards.push(...inRange);
      }
    }
  }

  if (front9Yards.length === 9 && back9Yards.length === 9) {
    for (let i = 0; i < 9; i++) {
      yards[i] = front9Yards[i];
      confidence[i] = 0.85;
    }
    for (let i = 0; i < 9; i++) {
      yards[i + 9] = back9Yards[i];
      confidence[i + 9] = 0.85;
    }
  }

  return { yards, pars, confidence };
}
