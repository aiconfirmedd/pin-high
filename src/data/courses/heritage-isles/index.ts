/**
 * Heritage Isles Golf & Country Club
 * 10630 Plantation Bay Drive, Tampa Bay, FL 33647 · 813-907-7447
 *
 * Tips by Abs Mawji — tour professional & course record holder (62, gold tees)
 * Hole artwork by Bench Craft Company (© Heritage Isles Golf & Country Club)
 *
 * Tee data extracted from official website hole-by-hole maps (2023 revision):
 *   Red   ~4,832 yds  (Ladies forward)
 *   White ~5,615 yds  (Men's regular / Women's back)
 *   Blue  ~6,236 yds  (Men's middle)
 *   Gold  ~6,954 yds  (Men's back / Championship)
 *
 * Previously published ratings (USGA/SCGA):
 *   Gold  6,378 · 73.0/133  |  Blue  5,702 · 70.1/126
 * (small delta vs image totals — minor rounding on individual holes)
 */

import type { CourseStrategyDoc } from "../../courseStrategy";

// ─────────────────────────────────────────────────────────────────────────────
// Authoritative per-hole yardages (from official website hole maps, 2023)
// ─────────────────────────────────────────────────────────────────────────────
export const HERITAGE_YARDAGES: {
  hole: number; par: number; hcp: number;
  red: number; white: number; blue: number; gold: number;
}[] = [
  { hole:  1, par: 4, hcp: 12, red: 284, white: 307, blue: 321, gold: 346 },
  { hole:  2, par: 5, hcp:  4, red: 402, white: 479, blue: 492, gold: 553 },
  { hole:  3, par: 4, hcp:  8, red: 307, white: 383, blue: 395, gold: 430 },
  { hole:  4, par: 4, hcp:  6, red: 324, white: 382, blue: 395, gold: 439 },
  { hole:  5, par: 3, hcp: 18, red: 130, white: 144, blue: 174, gold: 177 },
  { hole:  6, par: 4, hcp: 10, red: 242, white: 300, blue: 312, gold: 348 },
  { hole:  7, par: 5, hcp:  2, red: 405, white: 448, blue: 514, gold: 558 },
  { hole:  8, par: 3, hcp: 16, red: 115, white: 136, blue: 187, gold: 212 },
  { hole:  9, par: 4, hcp: 14, red: 252, white: 303, blue: 312, gold: 334 },
  { hole: 10, par: 4, hcp:  7, red: 292, white: 302, blue: 389, gold: 422 },
  { hole: 11, par: 5, hcp:  1, red: 418, white: 465, blue: 481, gold: 563 },
  { hole: 12, par: 4, hcp: 11, red: 218, white: 261, blue: 362, gold: 381 },
  { hole: 13, par: 3, hcp: 15, red: 123, white: 146, blue: 192, gold: 235 },
  { hole: 14, par: 4, hcp:  5, red: 274, white: 365, blue: 397, gold: 430 },
  { hole: 15, par: 5, hcp:  3, red: 410, white: 467, blue: 504, gold: 548 },
  { hole: 16, par: 3, hcp: 17, red: 129, white: 146, blue: 195, gold: 249 },
  { hole: 17, par: 4, hcp: 13, red: 232, white: 271, blue: 288, gold: 330 },
  { hole: 18, par: 4, hcp:  9, red: 275, white: 310, blue: 326, gold: 399 },
];

// Tee totals (summed from above)
// Red: 4,832 · White: 5,615 · Blue: 6,236 · Gold: 6,954
export const HERITAGE_TEE_TOTALS = {
  red:   HERITAGE_YARDAGES.reduce((s, h) => s + h.red,   0), // 4832
  white: HERITAGE_YARDAGES.reduce((s, h) => s + h.white, 0), // 5615
  blue:  HERITAGE_YARDAGES.reduce((s, h) => s + h.blue,  0), // 6236
  gold:  HERITAGE_YARDAGES.reduce((s, h) => s + h.gold,  0), // 6954
};

// Official hole artwork (Bench Craft Company / Heritage Isles)
export const HOLE_IMAGE_URLS = Array.from({ length: 18 }, (_, i) =>
  `https://www.heritageislesgolf.com/wp-content/uploads/sites/6632/2017/10/hole_${String(i + 1).padStart(2, "0")}.jpg`
);

// ─────────────────────────────────────────────────────────────────────────────
// CourseStrategyDoc — full 18-hole strategy
// ─────────────────────────────────────────────────────────────────────────────
export const HERITAGE_ISLES: CourseStrategyDoc = {
  courseId: "heritage-isles",
  courseName: "Heritage Isles Golf & Country Club",
  location: "Tampa Bay, FL",
  designer: "Jed Azinger",
  par: 72,
  // Default/display tee (Blue men's middle)
  yds: 6236,
  tee: "Blue",
  slope: 133,
  rating: 73.0,
  opened: "1997",
  courseNotes: [
    "Tips by Abs Mawji — course record 62 (gold tees)",
    "4 tee boxes: Red (4,832) · White (5,615) · Blue (6,236) · Gold (6,954)",
    "Water influences every hole — distance control beats direction every time",
    "Back nine is harder overall — build a cushion on the front",
    "Greens 13 & 16 have severe back-to-front slopes — two-putt mentality",
    "Tee boxes are sheltered — always look at the flag for true wind direction",
    "Course record 62 set from gold tees by Abs Mawji",
  ],
  keyPrinciples: [
    "Aggressive play is rewarded when accurate — passive play piles up bogeys",
    "Wind check: look past the green, not at your feet on the tee",
    "Every par 3 has water — club selection beats pin hunting",
    "The back nine is harder — make birdies early",
    "Green speeds are fast; uphill putts can be struck confidently",
  ],
  roundTargets: [
    { tier: "Scratch goal",   front: "34",  back: "37",  total: "71",  notes: "Attack birdie holes, survive the tough par 3s" },
    { tier: "HCP 12 target",  front: "40",  back: "42",  total: "82",  notes: "Par defend holes 7, 11, 13; make birdies on 2, 9, 14" },
    { tier: "Bogey baseline", front: "45",  back: "45",  total: "90",  notes: "Avoid doubles on par 3s and hole 7" },
  ],
  birdieWindows:   [2, 6, 9, 10, 12, 14, 15],
  parDefendHoles:  [3, 7, 11, 13, 16],
  preRoundChecklist: [
    "Check wind direction on the range — Tampa Bay afternoon winds shift SE→SW",
    "Note pin sheets: H5, H8, H13, H16 are all water-front par 3s",
    "Warm up your wedge — approach distances at Heritage Isles demand precision",
    "Identify your layup number for H7 and H11 before you get there",
    "Play White or Blue tees if it's windy — Gold turns par 3s into survival tests",
  ],
  holes: [
    {
      hole: 1, par: 4, yds: 321, hdcp: 12,
      target: "Par/Birdie",
      features: "Corner dogleg right with water right side. Shallow crowned green. Tee shot opens past the corner.",
      hazards: "Water right throughout. Crowned green sheds chips off.",
      aim: "Driver or 3W toward right greenside bunker line — fairway opens past the corner. Aggressive mindset is actually the safer play.",
      ideal: "Mid-iron approach. Distance control is the challenge on this shallow crowned green. Take enough club — pin left plays longer.",
      wedge: "Crown means chips run off — land it on the putting surface, not short of it.",
      go: "Open the round with a full commitment off the tee. Fairway opens up nicely.",
      noGo: "Short left of the green — chips bounce away from the crown.",
    },
    {
      hole: 2, par: 5, yds: 492, hdcp: 4,
      target: "Birdie",
      features: "Long swinging dogleg left. Fairway ridge splits the green in two. 50yd and 230yd markers visible.",
      hazards: "Too far past corner goes through fairway. Too short leaves blocked lay-up angle.",
      aim: "Tee shot just right of the corner — not too far (through fairway), not too short (blocked). Set up clean lay-up view.",
      ideal: "3 shots: drive to corner, lay up to your favorite wedge number, attack the pin. Pick a tier before you putt.",
      wedge: "Ridge splits the green — putt from the wrong tier = 3-putt. Commit to a side.",
      go: "Birdie is the expected score here for HCP 12. Attack it.",
      noGo: "Trying to carry the corner — aim right of it and let the fairway feed the ball.",
    },
    {
      hole: 3, par: 4, yds: 395, hdcp: 8,
      target: "Par",
      features: "Toughest hole into the wind. Diagonal fairway bunker. Large signature tree left blocks approach. Narrow deep green, bunkers both sides.",
      hazards: "Diagonal bunker catches slightly right tee shots. Tree blocks left approach. Right of green is bigger trouble than the tree.",
      aim: "Favor right side of fairway — diagonal bunker catches slightly wayward shots. Far left gets blocked by the Big Tree.",
      ideal: "Don't fight the tree — punch out or lay back if blocked. Narrow green with bunkers and hazards both sides. Bowl-shaped green feeds center.",
      wedge: "Bowl shape funnels everything to center — uphill putt expected. Not a bad thing.",
      go: "Right-center approach clears both the tree and right hazard.",
      noGo: "Right of the green — worse than dealing with the tree.",
    },
    {
      hole: 4, par: 4, yds: 395, hdcp: 6,
      target: "Par/Birdie",
      features: "One of the longest par 4s. Slightly uphill approach. Front left bunker. Friendly round green, minimal undulation.",
      hazards: "Front left bunker on approach.",
      aim: "Swing away off the tee, fairway is generous. Everything is right in front of you.",
      ideal: "Long iron/hybrid approach is slightly uphill — take one more club than you think. Avoid front left bunker.",
      wedge: "Round green with minimal break — straight putting lines.",
      go: "Take extra club on the approach — the uphill grade fools everyone short.",
      noGo: "Front left bunker — no easy up-and-down from there.",
    },
    {
      hole: 5, par: 3, yds: 174, hdcp: 18,
      target: "Par",
      features: "Shortest par 3. Very thin kidney-bean green. Long right bunker. Awkward chips surround every miss.",
      hazards: "Long right bunker. Tricky chips all around the green.",
      aim: "Distance control is everything. The thin green punishes long and short equally. Avoid the right bunker.",
      ideal: "Put the ball on the green, anywhere. Shallow green fools you on side-to-side break.",
      wedge: "Watch side-to-side speed — ball can run well away from you on this shallow putting surface.",
      go: "Middle of the green — always safe, always a birdie look.",
      noGo: "Short right near the right bunker — very difficult chip from there.",
    },
    {
      hole: 6, par: 4, yds: 312, hdcp: 10,
      target: "Birdie",
      features: "Short par 4. Water both sides of fairway. Pine tree front left near green. Green slopes right to left.",
      hazards: "Water left and right throughout the hole.",
      aim: "Accuracy over distance — fairway wood or long iron. The fairway is tight with water both sides.",
      ideal: "Mid-iron approach. Pine tree can interfere front left — right-to-left slope on green makes it easy to avoid.",
      wedge: "Aggressive on middle/back pins. Front left pin: slope runs away from hole — don't chase it.",
      go: "Middle and back pins — attack. Short par 4 with a reachable green.",
      noGo: "Front left pin — slope takes the ball away from the hole.",
    },
    {
      hole: 7, par: 5, yds: 514, hdcp: 2,
      target: "Par",
      features: "Double dogleg par 5. Environmentally protected hazards both sides. Very receptive green.",
      hazards: "Protected hazard left — unplayable if pushed. Right side slopes hard toward hazard.",
      aim: "Left-center off the tee. Aggressive lay-up to the corner clears trouble and opens the whole green.",
      ideal: "3 shots every time: safe drive, smart lay-up past the corner, wedge in. Green is receptive.",
      wedge: "Respect the long back-to-front putt — it has a lot of speed through the back portion.",
      go: "Hit enough club on the lay-up to clear the corner — don't leave it short.",
      noGo: "Right side off the tee — pushed/sliced drives run into unplayable protected area.",
    },
    {
      hole: 8, par: 3, yds: 187, hdcp: 16,
      target: "Birdie",
      features: "Long par 3. Very large round flat green. Four left bunkers block water. Water right — very little room.",
      hazards: "Water right of green. Tee box is sheltered — gives false wind read.",
      aim: "Look past the green for real wind direction — tee is sheltered. Four bunkers left block most shots from reaching water.",
      ideal: "Large flat green = any shot that finds it leaves a genuine birdie look. Err left of center.",
      wedge: "Green has very little slope — great opportunity if you hit the green.",
      go: "Commit to center-left of the large green and trust the club selection.",
      noGo: "Right of the green — almost no margin before the water.",
    },
    {
      hole: 9, par: 4, yds: 312, hdcp: 14,
      target: "Par/Birdie",
      features: "Short par 4. Deep bunkers and water. Well-protected green with slope. Sets up for a draw.",
      hazards: "Deep bunkers. Water. Front short bunker guards green entry.",
      aim: "Fairway metal or hybrid — avoid the deep bunkers and water. Sets up nicely for a draw.",
      ideal: "Short iron approach. Take enough club to carry the front bunker. Pins left play longer.",
      wedge: "Deceptive back-to-front slope will test your second putt pace.",
      go: "Land on the green past the front bunker — any pin position is makeable.",
      noGo: "Short of the front bunker — near impossible chip from there.",
    },
    {
      hole: 10, par: 4, yds: 389, hdcp: 7,
      target: "Birdie",
      features: "Generous fairway — more room right than it appears. Green wraps around right bunker. Left-to-right slope.",
      hazards: "Bunkers surrounding green. Back-right pin is the hardest.",
      aim: "Rip driver — more fairway right than it looks. Hit toward the right bunker line to use the L-to-R slope.",
      ideal: "Use the left-to-right slope to feed into back-right pin. Front/mid pins = easier birdie looks.",
      wedge: "Confident stroke needed on back-right — slope runs everything away.",
      go: "Hit away from the right bunker and let the slope work.",
      noGo: "Direct line at a back-right pin from the left — slope fights you all the way.",
    },
    {
      hole: 11, par: 5, yds: 481, hdcp: 1,
      target: "Par",
      features: "Toughest hole on the course. Generous fairway with bunkers. Protected hazard in front of green. Drop area available.",
      hazards: "Fairway bunkers complicate the lay-up. Protected environmental hazard directly in front of green.",
      aim: "Drive to the generous fairway, avoid the bunkers. Second shot: land just inside 150 for a short iron carry over the hazard.",
      ideal: "3 shots: drive, layup to 100-130, wedge over the hazard. Green funnels to center most of the time.",
      wedge: "Be aggressive on back pins — dip in the green carries a lot of speed back to front.",
      go: "Lay up to 100-130 and commit to carrying the hazard with a short iron.",
      noGo: "Trying to reach in two past the bunkers — lay-up from a fairway bunker is the nightmare.",
    },
    {
      hole: 12, par: 4, yds: 362, hdcp: 11,
      target: "Birdie",
      features: "Dogleg left. Water left. OB right. Back-left greenside bunker wraps around. Green slopes back to front.",
      hazards: "Water left. OB right. Back-left bunker wraps around — very difficult recovery.",
      aim: "Left of the right fairway bunker — more room left than it looks. Mid-to-short iron in.",
      ideal: "Green holds well — take enough club. Area short of green is soft with bad bounces — fly it onto the surface.",
      wedge: "Back-to-front slope gives a good birdie opportunity from anywhere near center.",
      go: "Take enough club to carry the front edge — land it on the green.",
      noGo: "Back-left bunker — wraps around and leaves a nearly impossible shot.",
    },
    {
      hole: 13, par: 3, yds: 192, hdcp: 15,
      target: "Par",
      features: "Long par 3. Shallow green. Severe back-to-front slopes. Valley short right near palm trees.",
      hazards: "Valley short-right near palm trees — awkward lie. Large lake left.",
      aim: "Distance control is everything. Short and center-left lands in an uphill chip — manageable. Avoid short right valley.",
      ideal: "Anywhere on the green is the goal. Back pin positions may require putting into the fringe to combat the slope.",
      wedge: "Severe slopes — par is a solid score on this green. Two-putt mentality.",
      go: "Short of the green center — uphill chip is the best miss.",
      noGo: "Short right near the palm trees — very awkward uneven lie.",
    },
    {
      hole: 14, par: 4, yds: 397, hdcp: 5,
      target: "Birdie",
      features: "Straight par 4. Water short wraps right. One of the largest greens on the course. Back-to-front slope.",
      hazards: "Water short and right of the green.",
      aim: "Driver up the left side — water is short and wraps right. Long iron approach.",
      ideal: "Large green = attack any pin. Anything short catches soft fringe — still manageable.",
      wedge: "Green slopes back to front. Uphill putts: hit it — downhill: be careful with pace.",
      go: "Attack any pin on this big green — it's the most generous target on the course.",
      noGo: "Right side off the tee where water wraps around.",
    },
    {
      hole: 15, par: 5, yds: 504, hdcp: 3,
      target: "Birdie",
      features: "Generous fairway but uphill — kills roll. Lake right from second shot on. Shallow green with false front.",
      hazards: "Lake right on second shot. False front catches under-clubbers on third shot.",
      aim: "Favor right side even into rough — uphill fairway kills roll, take extra club on everything.",
      ideal: "Drive right rough, layup left of the lake, wedge past the false front. Fly the approach past the front edge.",
      wedge: "Flat putts middle. Left plays uphill (confidence putt). Right plays hard and fast.",
      go: "Lay up left of the lake on the second — don't gamble over water when the 3-shot route works.",
      noGo: "Second shot toward the lake — worse than losing distance.",
    },
    {
      hole: 16, par: 3, yds: 195, hdcp: 17,
      target: "Par",
      features: "Demanding par 3. Large receptive green. Bunkers right. Water hazard left. Wind is a major factor.",
      hazards: "Bunkers right. Water left. Tee sheltered — false wind read.",
      aim: "Look at the pin for wind — the tee is sheltered. Large green if you hit it. Mid or long iron.",
      ideal: "Center of the large green. Front-left pin is easiest, progressively harder toward back-right.",
      wedge: "Slight back-to-front and right-to-left slope. Front-left is the easiest putt on the course.",
      go: "Commit to the wind-adjusted club and trust the large target.",
      noGo: "Guessing wind from the sheltered tee box — always look at the flag before choosing a club.",
    },
    {
      hole: 17, par: 4, yds: 288, hdcp: 13,
      target: "Par",
      features: "Short par 4. Right bunker and water right. Bunker just short of green. Crowned middle green.",
      hazards: "Right fairway bunker. Water right. Front bunker just short of green.",
      aim: "3-wood or hybrid is enough — leaves a short-to-mid iron. Stay left of the right bunker.",
      ideal: "Green has a bunker just short — take more club to clear it. Crowned middle makes side-to-side putts tricky.",
      wedge: "When in doubt, take more club to clear the front bunker.",
      go: "Lay back with a fairway metal, leave a comfortable wedge approach.",
      noGo: "Right side at any point — bunker and water compound quickly.",
    },
    {
      hole: 18, par: 4, yds: 326, hdcp: 9,
      target: "Par",
      features: "Finishing hole. Fairway bunkers both sides. Water right — slope feeds into it. False front on green. Generous green size.",
      hazards: "Fairway bunkers. Water right — right slope feeds everything in. False front.",
      aim: "Keep tee shot up the LEFT — right side has a slope that feeds every ball into water.",
      ideal: "Mid-iron in. Green looks small but is actually generous. Take enough to fly the false front.",
      wedge: "Defensive on deep-middle pins — ball keeps running past the hole.",
      go: "Left-center tee shot, clean mid-iron, standard two-putt finish.",
      noGo: "Right side off the tee — the slope feeds everything into the water.",
    },
  ],
};
