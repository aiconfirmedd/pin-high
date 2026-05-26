// src/data/heritageIslesStrategy.ts
// Heritage Isles Golf & Country Club — Hole-by-Hole Strategy
// Location: 10630 Plantation Bay Drive, Tampa Bay, FL 33647 | (813) 907-7447
// Designer: Gordon G. Lewis / Jed Azinger | Opened 2000
// Tips by: Abs Mawji — tour professional, course record holder (62 from gold)
// Scorecard source: AllSquareGolf.com + heritageislesgolf.com
// Tees in 6500–5800 range: Gold (6,378 · 73.0/133) and Blue (5,702 · 70.1/126)

import type { CourseStrategyDoc, HoleStrategy } from "./courseStrategy";

// ─── Scorecard Data ────────────────────────────────────────────────────────────

// Par:  4  5  4  4  3  4  5  3  4 | 36  |  4  5  4  3  4  5  3  4  4 | 36 | 72
// HCP: 12  4  8  6 18 10  2 16 14 |     |  7  1 11 15  5  3 17 13  9
// Gold: 316 506 393 401 182 318 510 194 305 | 3125 | 386 515 348 215 393 501 228 302 365 | 3253 | 6378
// Blue: 294 450 361 361 159 285 470 171 285 | 2836 | 356 440 331 176 363 461 178 263 298 | 2866 | 5702

interface HeritageTeeData {
  gold: number;
  blue: number;
}

export const HERITAGE_YARDAGES: HeritageTeeData[] = [
  { gold: 316, blue: 294 },  // H1
  { gold: 506, blue: 450 },  // H2
  { gold: 393, blue: 361 },  // H3
  { gold: 401, blue: 361 },  // H4
  { gold: 182, blue: 159 },  // H5
  { gold: 318, blue: 285 },  // H6
  { gold: 510, blue: 470 },  // H7
  { gold: 194, blue: 171 },  // H8
  { gold: 305, blue: 285 },  // H9
  { gold: 386, blue: 356 },  // H10
  { gold: 515, blue: 440 },  // H11
  { gold: 348, blue: 331 },  // H12
  { gold: 215, blue: 176 },  // H13
  { gold: 393, blue: 363 },  // H14
  { gold: 501, blue: 461 },  // H15
  { gold: 228, blue: 178 },  // H16
  { gold: 302, blue: 263 },  // H17
  { gold: 365, blue: 298 },  // H18
];

// ─── Hole-by-Hole Strategy ─────────────────────────────────────────────────────

const holes: HoleStrategy[] = [
  {
    hole: 1, par: 4, yds: 316, hdcp: 12, target: "Par",
    features: "Opening par 4. Fairway opens up past the corner. Aggressive mindset may be the safer option — nerves on hole 1 can be the biggest hazard.",
    hazards: "Green-side bunker right. Shallow, crowned green penalizes inaccurate approaches.",
    aim: "Aim toward the right green-side bunker off the tee — opens up the fairway. Approach: take dead aim at the center of the crowned green.",
    ideal: "Driver or 3W off the tee. Short or mid iron in. Take one extra club — shallow green falls off quickly.",
    wedge: "Distance control is everything. Short-side miss is worse than a long miss.",
  },
  {
    hole: 2, par: 5, yds: 506, hdcp: 4, target: "Birdie",
    features: "Long swinging dogleg left par 5 — HCP 4 means course defense is real. Two-tiered green split by a ridge.",
    hazards: "Right of corner is through the fairway. Too little distance and you carry trouble. A ridge splits the green — wrong level = 3-putt.",
    aim: "Tee: aim just right of the corner — center of fairway. Lay up to your favorite wedge distance. Approach must be accurate for a birdie look.",
    ideal: "Driver placed just right of the corner. Lay up to 100–115 yds. Precision approach to correct tier.",
    wedge: "Lay up distance determines wedge. Approach from 100–115 = PW or 9-iron. Commit to the correct tier.",
    go: "Only attempt green in 2 if you have a flat lie, correct tier angle, and 230+ carry left.",
    noGo: "Any lie that forces the wrong approach angle to the two-tiered green. 3-shot it — birdie is still very makeable.",
  },
  {
    hole: 3, par: 4, yds: 393, hdcp: 8, target: "Par",
    features: "Toughest hole on front 9. Into wind can test you early. Signature large tree comes into play left side. Very narrow, deep green.",
    hazards: "Diagonal fairway bunker catches slightly wayward tee shots right. Large tree left of center can block approach. Bunkers and hazards guard both sides of the narrow green.",
    aim: "Tee: favor the right side — avoid the diagonal bunker. Don't go too far left (blocked by tree). Approach: right side = OB, center of narrow deep green only.",
    ideal: "Driver right-center. Mid iron approach to deep green. Bowl-shaped putting surface feeds to center.",
    wedge: "Long iron or hybrid approach. Take enough club — into wind, this hole plays much longer.",
  },
  {
    hole: 4, par: 4, yds: 401, hdcp: 6, target: "Par",
    features: "One of the longest par 4s on the course. Straightforward layout — everything in front of you. Slightly uphill approach fools players into underclubbing.",
    hazards: "Front left bunker protects the green on approach. Slightly uphill means shots come up short more often than expected.",
    aim: "Swing away — keep the drive on the fairway. Approach: take 1 extra club (uphill plays longer). Avoid front left bunker.",
    ideal: "Driver down the fairway. Long iron or hybrid approach. Friendly round green — hit center and 2-putt.",
    wedge: "N/A for approach — long iron or hybrid. If in trouble: 54° M-grind from any rough.",
  },
  {
    hole: 5, par: 3, yds: 182, hdcp: 18, target: "Par",
    features: "Shortest par 3 on the course (182 gold / 159 blue). Kidney bean shaped green — thin and very challenging to hit. HCP 18 = easiest hole, but don't be fooled.",
    hazards: "Long bunker on the right. Shallow green — chip shots surround it from all sides. Right side to left speed can run away from you.",
    aim: "Distance control above all else. Middle of the kidney bean — avoid short-siding. Right bunker is the key miss to avoid.",
    ideal: "Mid iron (6 or 7 depending on wind). Solid pure contact beats pin hunting here.",
    wedge: "If short: 58° T-grind from tight lies. Shallow green — spin landing is critical.",
  },
  {
    hole: 6, par: 4, yds: 318, hdcp: 10, target: "Par",
    features: "Short par 4 with water on both sides of the fairway. Accuracy beats distance. Pine tree may interfere on approach to front left pin.",
    hazards: "Water both sides of fairway. Pine tree front-left approach. Green slopes right to left — aggressive for middle/back, treacherous for front.",
    aim: "Tee: fairway wood or long iron — accuracy over distance. Approach: allow for right-to-left slope.",
    ideal: "3W or 4-iron off tee to set up a short iron approach. Front pins play harder — aim away from pine tree.",
    wedge: "Short approach (80–110 yds typical). 50° MG or 54° M-grind depending on distance.",
    go: "Middle and back pins: be aggressive — slope helps you. Front pin: aim right, let the slope bring it in.",
    noGo: "Driver on this hole. Water both sides does not forgive.",
  },
  {
    hole: 7, par: 5, yds: 510, hdcp: 2, target: "Par",
    features: "Double dogleg par 5 — HCP 2, hardest hole on the back. Environmentally protected hazards line both sides for most of the hole.",
    hazards: "Right side slopes toward hazard — pushed/sliced drives are usually unplayable. Left hazard all the way to second dogleg. Very receptive green if you navigate the approach correctly.",
    aim: "Tee: good drive is vital — no margin right. Lay-up: aggressive to the corner to open the green. Center green approach after.",
    ideal: "Driver left-center. Aggressive layup past corner. Short iron to receptive green. Respect the long back-to-front putt.",
    wedge: "Layup to 100: 50° MG full. From 80: 54° M-grind. Long back-to-front putt — keep it below the hole.",
    go: "Only if drive lands left-center AND you have clear sight of green: 3W or 4-iron at front edge.",
    noGo: "If drive is at all right: mandatory layup. Environmental hazard right makes penalty strokes likely.",
  },
  {
    hole: 8, par: 3, yds: 194, hdcp: 16, target: "Par",
    features: "Long par 3 with a very large round green. Four bunkers left protect from the water. Wind direction can be deceiving — tee is sheltered.",
    hazards: "Water right of green — very little margin. Four bunkers left. Wind off the tee box is misleading — check the flag and trees beyond.",
    aim: "Look beyond the green for wind before choosing club. Center of large green — bunkers left are far safer than water right.",
    ideal: "Long iron (4–6 depending on wind). Slight left-center bias to take right water out of play.",
    wedge: "N/A for tee shot. Green is very flat — any ball finding it leaves a birdie putt.",
  },
  {
    hole: 9, par: 4, yds: 305, hdcp: 14, target: "Par",
    features: "Tricky short par 4 finishes the front 9. Sets up nicely for a draw. Deep bunkers and water off the tee.",
    hazards: "Deep bunkers and water on tee shot. Well-protected green with slope from back to front. Pins left play longer.",
    aim: "Tee: fairway metal or hybrid — draw bias works well here. Approach: take enough club over the front bunker. Left pins play longer.",
    ideal: "3W or hybrid off tee. Short iron approach — take enough club to cover the front bunker.",
    wedge: "Approach 90–120 yds typical. 50° MG for 90–110, PW for 110–125. Back-to-front green — deceptive second putts.",
  },
  {
    hole: 10, par: 4, yds: 386, hdcp: 7, target: "Par",
    features: "Hole difficulty is dictated by pin position. Generous fairway — more room right than it appears. Green slightly wraps around right bunker.",
    hazards: "Well-positioned bunkers surround green. Back right pin is the most challenging.",
    aim: "Driver — more fairway right than it looks. Approach: aim away from the right bunker, use left-to-right slope to work toward back right pin.",
    ideal: "Driver right-center. Mid iron approach. Front and middle pins = birdie look. Back right pin = confident stroke required.",
    wedge: "Mid iron approach from 130–160. 9-iron or PW for shorter distances.",
  },
  {
    hole: 11, par: 5, yds: 515, hdcp: 1, target: "Par",
    features: "Toughest hole on the course — HCP 1. Par 5 but it's all about the approach. Environmentally protected hazard in front of the green.",
    hazards: "Fairway bunkers off tee. Environmentally protected hazard between layup zone and green. Drop area is on the other side.",
    aim: "Tee: generous fairway, avoid the bunkers. Layup: must be inside 150 yds with clear view of green. Approach: carry the hazard with short or mid iron.",
    ideal: "Driver fairway-first. Lay up to 130–150 with 7W or hybrid. Short iron over hazard to green center.",
    wedge: "Layup to 100: 50° MG full. From 130: 9-iron. Carry is mandatory — don't come up short of the hazard.",
    go: "Only if drive is perfect, lie is flat, and you carry 220+ to front edge of green.",
    noGo: "Any bunker off tee = mandatory 3-shot. Don't force the green in 2 from the rough.",
  },
  {
    hole: 12, par: 4, yds: 348, hdcp: 11, target: "Par",
    features: "Dogleg left par 4 with water hazard left and OB right. More room left than it appears.",
    hazards: "Water up the left side. OB right. Right fairway bunker. Left greenside bunker wraps around the back — very difficult recovery.",
    aim: "Tee: left of right fairway bunker — more left room than appears. Approach: avoid left-back bunker at all costs. Green holds well — take enough club.",
    ideal: "Driver left of center. Mid iron approach. Green slopes slightly back to front — birdie opportunity.",
    wedge: "Area short of green = soft lie, bad bounces. Fly the green front edge. 50° MG or 9-iron from 100–140.",
  },
  {
    hole: 13, par: 3, yds: 215, hdcp: 15, target: "Par",
    features: "Long par 3 with a shallow, severely sloped green. Getting the ball on and somewhat close is an accomplishment.",
    hazards: "Valley short-right near palm trees — awkward lie. Green has severe back-to-front slopes with significant break. Back pin positions may require putting into the fringe.",
    aim: "Distance control critical. Short = simple chip up the hill. Avoid the valley short right. Center of green is the win.",
    ideal: "Long iron (4 or 5). Pure contact — distance first, direction second.",
    wedge: "Greenside: 58° T-grind from tight lie near palm trees. 54° M-grind from rough. Severe slope = land below the hole.",
  },
  {
    hole: 14, par: 4, yds: 393, hdcp: 5, target: "Par",
    features: "Sneaky long straight par 4. Water hazard short of fairway wraps around to the right. One of the most generous greens on the course.",
    hazards: "Water hazard short of fairway wraps right. Fringe catches short approaches — soft landing, no favorable bounces.",
    aim: "Tee: driver up the left side. Approach: generous green — aim center, fly the fringe.",
    ideal: "Driver left side. Mid to long iron approach. Large green — hit center and 2-putt.",
    wedge: "Any shot that's short lands soft in fringe. Fly the front edge. Green slopes back to front — uphill putts are safe.",
  },
  {
    hole: 15, par: 5, yds: 501, hdcp: 3, target: "Birdie",
    features: "Straightforward par 5 with a generous fairway. Slightly uphill — don't expect much roll. Lake right comes into play on second shot.",
    hazards: "Lake right on second shot. Shallow green with a false front — many players under-club and chip back. Flat middle putts, tough right side speed.",
    aim: "Tee: driver favor right side (even rough) — slight uphill, less roll. 2nd shot: away from the lake if tee shot was right. Approach: short iron or wedge to shallow green.",
    ideal: "Driver right-center. 3W or hybrid away from lake. Short wedge to shallow green — trust the false front.",
    wedge: "100–120 = PW or 50° MG full. Take enough club for the false front. Right side plays fast — aim left.",
    go: "Only if perfect drive left-center and 220+ left with lake right clearly out of play.",
    noGo: "Drive to the right: mandatory layup left of lake. Shallow green eats under-clubbed approaches.",
  },
  {
    hole: 16, par: 3, yds: 228, hdcp: 17, target: "Par",
    features: "Demanding par 3 — possible longest par 3 in the area. Well-bunkered, water left. You may not feel the wind on the tee — check the pin.",
    hazards: "Water hazard left. Bunkers right. Wind is masked on tee box — look at pin and trees for real direction.",
    aim: "Check the pin for wind before choosing club. Mid to long iron if you can hit it. Green is receptive to confident strikes.",
    ideal: "3-iron or 4-iron (or 5W in wind). Aim center green. Front left pin is easiest — progressively harder toward back right.",
    wedge: "Greenside: 58° T-grind from tight lie. 54° M-grind from rough. Green slopes slightly back to front and right to left.",
  },
  {
    hole: 17, par: 4, yds: 302, hdcp: 13, target: "Par",
    features: "Short tricky par 4. Bunkers and water right come into play. 3W or hybrid is plenty off the tee.",
    hazards: "Right fairway bunker. Water hazard right comes into play. Well-positioned bunker just short of green.",
    aim: "Tee: keep left of right bunker — 3W or hybrid. Approach: when in doubt, take more club to fly the short bunker.",
    ideal: "3W or hybrid leaves short or mid iron. Approach: fly the front bunker with confidence.",
    wedge: "Crowned green — mid approach. Putts from either side are makeable but side-to-side is tricky.",
  },
  {
    hole: 18, par: 4, yds: 365, hdcp: 9, target: "Par",
    features: "Signature finishing hole. Well-protected tee shot with fairway bunkers and hazard up the right side. Green is actually larger than it looks from the fairway.",
    hazards: "Fairway bunkers and hazard right — anything right kicks to water. Green has a false front — under-clubbing is the most common mistake.",
    aim: "Tee: must stay left of hazard right. Keep it up the left side. Approach: deceiving green — take enough club, fly the false front.",
    ideal: "Driver up the left side. Any ball right finds the slope into water. Mid iron approach — commit to flying the false front.",
    wedge: "Approach typically 130–160. 9-iron or PW. One of the easier greens to putt — be defensive with deep middle pins.",
  },
];

// ─── Course Document ───────────────────────────────────────────────────────────

export const HERITAGE_ISLES: CourseStrategyDoc = {
  courseId: "heritage-isles",
  courseName: "Heritage Isles Golf & Country Club",
  location: "Tampa Bay, FL",
  designer: "Gordon G. Lewis / Jed Azinger",
  par: 72,
  yds: 6378,  // Gold tee (closest to 6500 target)
  tee: "Gold",
  slope: 133,
  rating: 73.0,
  opened: "2000",

  courseNotes: [
    "Par 3s are possibly the most challenging in the Tampa area (per head pro Rick Bradshaw)",
    "Course record: 62 from the gold tees — set by Abs Mawji, tour professional",
    "Gold tees: 6,378 yds · 73.0/133 — Blue tees: 5,702 yds · 70.1/126",
    "White tees: 5,135 yds · 67.2/117",
    "Environmentally protected hazards on multiple holes — penalty areas, not waste areas",
    "Most greens have subtle-to-severe back-to-front slopes — stay below the hole",
    "Uphill approaches on #4 and #15 regularly fool players into underclubbing",
  ],

  keyPrinciples: [
    "Par 3s (#5, #8, #13, #16) are the toughest set in Tampa — treat each as a par-saver, not a birdie hole.",
    "HCP 1 and 2 (#11 and #7) are genuine bogey-avoidance holes. Par wins. Don't force the green in 2 on either.",
    "Short par 4s (#6, #9, #17) require accuracy not length — fairway wood or hybrid is the right play off the tee.",
    "Back-to-front slope exists on most greens. Always leave yourself below the hole — aggressive downhill putts run out.",
    "Wind off the tee box is often sheltered. Check the flag and trees beyond the green before choosing club on par 3s.",
  ],

  roundTargets: [
    { tier: "Conservative", front: "38–40", back: "38–40", total: "76–80", notes: "Pars on HCP 1–4, avoid doubles" },
    { tier: "Realistic",    front: "36–38", back: "36–38", total: "72–76", notes: "Birdie windows #2, #6, #9, #15" },
    { tier: "Best-case",    front: "34–35", back: "34–35", total: "68–70", notes: "Need to convert 3+ birdie looks" },
  ],

  birdieWindows: [2, 6, 9, 10, 12, 14, 15],
  parDefendHoles: [7, 11, 3, 13],

  preRoundChecklist: [
    "Wind direction — par 3s (#5, #8, #13, #16) all play differently in wind",
    "Check tee box (Gold = 6,378 · Blue = 5,702) — know your course rating before you tee off",
    "Hole 2: know which tier the pin is on — three-putt risk if you miss the level",
    "Holes 7 and 11: plan your 3-shot strategy from the tee — don't improvise mid-hole",
    "Hole 11: carry the environmental hazard — know your carry numbers, drop area is on the far side",
    "Holes 4 and 15: take 1 extra club — both approach shots are uphill and routinely underclubbed",
    "Hole 18: tee shot MUST stay left — water catches anything that drifts right",
  ],

  holes,
};

// ─── Register in courses registry ─────────────────────────────────────────────

// Add to COURSES_BY_ID in courseStrategy.ts when ready to activate
// import { HERITAGE_ISLES } from "./heritageIslesStrategy";
// COURSES_BY_ID["heritage-isles"] = HERITAGE_ISLES;
