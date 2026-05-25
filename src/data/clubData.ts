// src/data/clubData.ts
// Curated golf club brand and model dataset (2005-present)
// Used for autocomplete in Club Setup

export interface ClubModel {
  brand: string;
  model: string;
  type: ClubType;
  years: string;
}

export type ClubType =
  | "driver"
  | "fairway"
  | "hybrid"
  | "iron"
  | "wedge"
  | "putter";

export const CLUB_BRANDS: readonly string[] = [
  "Titleist",
  "Callaway",
  "TaylorMade",
  "Ping",
  "Mizuno",
  "Cobra",
  "Cleveland",
  "Srixon",
  "Odyssey",
  "Scotty Cameron",
  "Vokey",
  "Bridgestone",
  "Wilson",
  "Adams",
  "Nike",
  "PXG",
];

export const CLUB_MODELS: ClubModel[] = [
  // --- TITLEIST DRIVERS ------------------------------------
  { brand: "Titleist", model: "GT2", type: "driver", years: "2024" },
  { brand: "Titleist", model: "GT3", type: "driver", years: "2024" },
  { brand: "Titleist", model: "GT4", type: "driver", years: "2024" },
  { brand: "Titleist", model: "TSR2", type: "driver", years: "2022-2023" },
  { brand: "Titleist", model: "TSR3", type: "driver", years: "2022-2023" },
  { brand: "Titleist", model: "TSR4", type: "driver", years: "2022-2023" },
  { brand: "Titleist", model: "TSi2", type: "driver", years: "2020-2021" },
  { brand: "Titleist", model: "TSi3", type: "driver", years: "2020-2021" },
  { brand: "Titleist", model: "TS2", type: "driver", years: "2018-2019" },
  { brand: "Titleist", model: "TS3", type: "driver", years: "2018-2019" },
  { brand: "Titleist", model: "917 D2", type: "driver", years: "2016-2017" },
  { brand: "Titleist", model: "917 D3", type: "driver", years: "2016-2017" },
  // --- TITLEIST FAIRWAYS -----------------------------------
  { brand: "Titleist", model: "GT2", type: "fairway", years: "2024" },
  { brand: "Titleist", model: "GT3", type: "fairway", years: "2024" },
  { brand: "Titleist", model: "TSR2", type: "fairway", years: "2022-2023" },
  { brand: "Titleist", model: "TSR3", type: "fairway", years: "2022-2023" },
  { brand: "Titleist", model: "TSi2", type: "fairway", years: "2020-2021" },
  { brand: "Titleist", model: "TSi3", type: "fairway", years: "2020-2021" },
  { brand: "Titleist", model: "TS2", type: "fairway", years: "2018-2019" },
  // --- TITLEIST HYBRIDS ------------------------------------
  { brand: "Titleist", model: "TSi2", type: "hybrid", years: "2020-2021" },
  { brand: "Titleist", model: "TSi3", type: "hybrid", years: "2020-2021" },
  // --- TITLEIST IRONS --------------------------------------
  { brand: "Titleist", model: "T100", type: "iron", years: "2019-2024" },
  { brand: "Titleist", model: "T100S", type: "iron", years: "2021-2024" },
  { brand: "Titleist", model: "T150", type: "iron", years: "2022-2024" },
  { brand: "Titleist", model: "T200", type: "iron", years: "2019-2024" },
  { brand: "Titleist", model: "T300", type: "iron", years: "2019-2024" },
  { brand: "Titleist", model: "T350", type: "iron", years: "2023-2024" },
  { brand: "Titleist", model: "AP1", type: "iron", years: "2005-2018" },
  { brand: "Titleist", model: "AP2", type: "iron", years: "2005-2018" },
  { brand: "Titleist", model: "AP3", type: "iron", years: "2017-2018" },
  { brand: "Titleist", model: "CB", type: "iron", years: "2005-2018" },
  { brand: "Titleist", model: "MB", type: "iron", years: "2005-2018" },
  // --- VOKEY WEDGES ----------------------------------------
  { brand: "Vokey", model: "SM10", type: "wedge", years: "2024" },
  { brand: "Vokey", model: "SM9", type: "wedge", years: "2022-2023" },
  { brand: "Vokey", model: "SM8", type: "wedge", years: "2020-2021" },
  { brand: "Vokey", model: "SM7", type: "wedge", years: "2018-2019" },
  { brand: "Vokey", model: "SM6", type: "wedge", years: "2016-2017" },
  { brand: "Vokey", model: "SM5", type: "wedge", years: "2014-2015" },
  // --- SCOTTY CAMERON PUTTERS ------------------------------
  { brand: "Scotty Cameron", model: "Super Select Newport 2", type: "putter", years: "2023-2024" },
  { brand: "Scotty Cameron", model: "Super Select GoLo 5", type: "putter", years: "2023-2024" },
  { brand: "Scotty Cameron", model: "Super Select Del Mar", type: "putter", years: "2023-2024" },
  { brand: "Scotty Cameron", model: "Phantom 5", type: "putter", years: "2022-2024" },
  { brand: "Scotty Cameron", model: "Phantom 11", type: "putter", years: "2022-2024" },
  { brand: "Scotty Cameron", model: "Phantom X 12", type: "putter", years: "2019-2021" },
  { brand: "Scotty Cameron", model: "Special Select Newport 2", type: "putter", years: "2021-2022" },
  { brand: "Scotty Cameron", model: "Fastback 1.5", type: "putter", years: "2020-2022" },
  { brand: "Scotty Cameron", model: "Fastback 2.5", type: "putter", years: "2020-2022" },
  { brand: "Scotty Cameron", model: "Special Select Del Mar", type: "putter", years: "2020-2022" },
  { brand: "Scotty Cameron", model: "Select Newport 2", type: "putter", years: "2014-2019" },
  { brand: "Scotty Cameron", model: "Futura X5", type: "putter", years: "2014-2018" },
  // --- CALLAWAY DRIVERS ------------------------------------
  { brand: "Callaway", model: "Paradym Ai Smoke", type: "driver", years: "2024" },
  { brand: "Callaway", model: "Paradym Ai Smoke Max", type: "driver", years: "2024" },
  { brand: "Callaway", model: "Paradym Ai Smoke LS", type: "driver", years: "2024" },
  { brand: "Callaway", model: "Paradym", type: "driver", years: "2023" },
  { brand: "Callaway", model: "Paradym X", type: "driver", years: "2023" },
  { brand: "Callaway", model: "Paradym Triple Diamond", type: "driver", years: "2023" },
  { brand: "Callaway", model: "Rogue ST Max", type: "driver", years: "2022" },
  { brand: "Callaway", model: "Rogue ST Max LS", type: "driver", years: "2022" },
  { brand: "Callaway", model: "Rogue ST Triple Diamond LS", type: "driver", years: "2022" },
  { brand: "Callaway", model: "Epic Max", type: "driver", years: "2021" },
  { brand: "Callaway", model: "Epic Speed", type: "driver", years: "2021" },
  { brand: "Callaway", model: "Mavrik", type: "driver", years: "2020" },
  { brand: "Callaway", model: "Epic Flash", type: "driver", years: "2019" },
  // --- CALLAWAY IRONS --------------------------------------
  { brand: "Callaway", model: "Apex Pro", type: "iron", years: "2019-2024" },
  { brand: "Callaway", model: "Apex", type: "iron", years: "2019-2024" },
  { brand: "Callaway", model: "Apex CB", type: "iron", years: "2021-2024" },
  { brand: "Callaway", model: "Apex MB", type: "iron", years: "2021-2024" },
  { brand: "Callaway", model: "Mavrik Pro", type: "iron", years: "2020" },
  { brand: "Callaway", model: "Rogue ST Pro", type: "iron", years: "2022" },
  { brand: "Callaway", model: "X Forged CB", type: "iron", years: "2021-2024" },
  // --- CALLAWAY WEDGES & PUTTERS ---------------------------
  { brand: "Callaway", model: "Mack Daddy CB", type: "wedge", years: "2022-2024" },
  { brand: "Callaway", model: "Mack Daddy Forged", type: "wedge", years: "2022-2024" },
  { brand: "Callaway", model: "Mack Daddy 5", type: "wedge", years: "2019-2021" },
  // --- ODYSSEY PUTTERS -------------------------------------
  { brand: "Odyssey", model: "White Hot OG #1", type: "putter", years: "2021-2024" },
  { brand: "Odyssey", model: "White Hot OG #2", type: "putter", years: "2021-2024" },
  { brand: "Odyssey", model: "White Hot OG #7", type: "putter", years: "2021-2024" },
  { brand: "Odyssey", model: "White Hot OG Double Wide", type: "putter", years: "2021-2024" },
  { brand: "Odyssey", model: "Tri-Hot 5K #1", type: "putter", years: "2022-2024" },
  { brand: "Odyssey", model: "Tri-Hot 5K Two", type: "putter", years: "2022-2024" },
  { brand: "Odyssey", model: "Ai-One #1", type: "putter", years: "2023-2024" },
  { brand: "Odyssey", model: "Ai-One Milled Seven", type: "putter", years: "2023-2024" },
  { brand: "Odyssey", model: "Stroke Lab", type: "putter", years: "2019-2022" },
  // --- TAYLORMADE DRIVERS ----------------------------------
  { brand: "TaylorMade", model: "Qi35", type: "driver", years: "2025" },
  { brand: "TaylorMade", model: "Qi35 LS", type: "driver", years: "2025" },
  { brand: "TaylorMade", model: "Qi35 Max", type: "driver", years: "2025" },
  { brand: "TaylorMade", model: "Qi10", type: "driver", years: "2024" },
  { brand: "TaylorMade", model: "Qi10 Max", type: "driver", years: "2024" },
  { brand: "TaylorMade", model: "Qi10 LS", type: "driver", years: "2024" },
  { brand: "TaylorMade", model: "Stealth 2", type: "driver", years: "2023" },
  { brand: "TaylorMade", model: "Stealth 2 Plus", type: "driver", years: "2023" },
  { brand: "TaylorMade", model: "Stealth", type: "driver", years: "2022" },
  { brand: "TaylorMade", model: "Stealth Plus", type: "driver", years: "2022" },
  { brand: "TaylorMade", model: "SIM2", type: "driver", years: "2021" },
  { brand: "TaylorMade", model: "SIM2 Max", type: "driver", years: "2021" },
  { brand: "TaylorMade", model: "SIM", type: "driver", years: "2020" },
  { brand: "TaylorMade", model: "M5", type: "driver", years: "2019" },
  { brand: "TaylorMade", model: "M6", type: "driver", years: "2019" },
  // --- TAYLORMADE FAIRWAYS & HYBRIDS -----------------------
  { brand: "TaylorMade", model: "Qi35", type: "fairway", years: "2025" },
  { brand: "TaylorMade", model: "Qi10", type: "fairway", years: "2024" },
  { brand: "TaylorMade", model: "Stealth 2", type: "fairway", years: "2023" },
  { brand: "TaylorMade", model: "SIM2", type: "fairway", years: "2021" },
  { brand: "TaylorMade", model: "Qi35", type: "hybrid", years: "2025" },
  { brand: "TaylorMade", model: "Qi10", type: "hybrid", years: "2024" },
  { brand: "TaylorMade", model: "Stealth 2", type: "hybrid", years: "2023" },
  { brand: "TaylorMade", model: "SIM2 Rescue", type: "hybrid", years: "2021" },
  // --- TAYLORMADE IRONS ------------------------------------
  { brand: "TaylorMade", model: "P790", type: "iron", years: "2017-2024" },
  { brand: "TaylorMade", model: "P770", type: "iron", years: "2017-2024" },
  { brand: "TaylorMade", model: "P760", type: "iron", years: "2019-2021" },
  { brand: "TaylorMade", model: "P7MB", type: "iron", years: "2021-2024" },
  { brand: "TaylorMade", model: "P7MC", type: "iron", years: "2021-2024" },
  { brand: "TaylorMade", model: "P7TW", type: "iron", years: "2019-2024" },
  { brand: "TaylorMade", model: "Qi10", type: "iron", years: "2024" },
  // --- TAYLORMADE WEDGES & PUTTERS -------------------------
  { brand: "TaylorMade", model: "MG4", type: "wedge", years: "2024-2025" },
  { brand: "TaylorMade", model: "MG3", type: "wedge", years: "2022-2023" },
  { brand: "TaylorMade", model: "Hi-Toe 4", type: "wedge", years: "2024-2025" },
  { brand: "TaylorMade", model: "Hi-Toe 3", type: "wedge", years: "2022-2023" },
  { brand: "TaylorMade", model: "Spider GT Max", type: "putter", years: "2022-2024" },
  { brand: "TaylorMade", model: "Spider X", type: "putter", years: "2019-2022" },
  { brand: "TaylorMade", model: "TP Hydro Blast", type: "putter", years: "2021-2024" },
  // --- PING ------------------------------------------------
  { brand: "Ping", model: "G430 Max", type: "driver", years: "2022-2024" },
  { brand: "Ping", model: "G430 Max 10K", type: "driver", years: "2024" },
  { brand: "Ping", model: "G430 LS Tec", type: "driver", years: "2022-2024" },
  { brand: "Ping", model: "G430 SFT", type: "driver", years: "2022-2024" },
  { brand: "Ping", model: "G425 Max", type: "driver", years: "2021" },
  { brand: "Ping", model: "G425 LST", type: "driver", years: "2021" },
  { brand: "Ping", model: "G410 Plus", type: "driver", years: "2019-2020" },
  { brand: "Ping", model: "G430 Max", type: "fairway", years: "2022-2024" },
  { brand: "Ping", model: "G425 Max", type: "fairway", years: "2021" },
  { brand: "Ping", model: "G430 Max", type: "hybrid", years: "2022-2024" },
  { brand: "Ping", model: "G425 Hybrid", type: "hybrid", years: "2021" },
  { brand: "Ping", model: "i230", type: "iron", years: "2022-2024" },
  { brand: "Ping", model: "i525", type: "iron", years: "2021-2024" },
  { brand: "Ping", model: "Blueprint S", type: "iron", years: "2023-2024" },
  { brand: "Ping", model: "Blueprint T", type: "iron", years: "2023-2024" },
  { brand: "Ping", model: "i210", type: "iron", years: "2019-2022" },
  { brand: "Ping", model: "G425", type: "iron", years: "2021" },
  { brand: "Ping", model: "Glide 4.0", type: "wedge", years: "2022-2024" },
  { brand: "Ping", model: "Glide 3.0", type: "wedge", years: "2019-2021" },
  { brand: "Ping", model: "PLD Milled Anser", type: "putter", years: "2022-2024" },
  { brand: "Ping", model: "PLD Milled DS72", type: "putter", years: "2022-2024" },
  { brand: "Ping", model: "Sigma 2 Anser", type: "putter", years: "2018-2022" },
  // --- MIZUNO ----------------------------------------------
  { brand: "Mizuno", model: "ST-Z 230", type: "driver", years: "2022-2023" },
  { brand: "Mizuno", model: "ST-X 220", type: "driver", years: "2021-2022" },
  { brand: "Mizuno", model: "JPX923 Forged", type: "iron", years: "2022-2023" },
  { brand: "Mizuno", model: "JPX923 Tour", type: "iron", years: "2022-2023" },
  { brand: "Mizuno", model: "JPX923 Hot Metal", type: "iron", years: "2022-2023" },
  { brand: "Mizuno", model: "JPX921 Forged", type: "iron", years: "2020-2021" },
  { brand: "Mizuno", model: "JPX921 Tour", type: "iron", years: "2020-2021" },
  { brand: "Mizuno", model: "JPX921 Hot Metal", type: "iron", years: "2020-2021" },
  { brand: "Mizuno", model: "MP-20 MB", type: "iron", years: "2019-2021" },
  { brand: "Mizuno", model: "MP-20 HMB", type: "iron", years: "2019-2021" },
  { brand: "Mizuno", model: "MP-20 MMC", type: "iron", years: "2019-2021" },
  { brand: "Mizuno", model: "T22", type: "wedge", years: "2021-2023" },
  { brand: "Mizuno", model: "T24", type: "wedge", years: "2023-2024" },
  { brand: "Mizuno", model: "M Craft OMOI", type: "putter", years: "2021-2024" },
  // --- COBRA -----------------------------------------------
  { brand: "Cobra", model: "Darkspeed", type: "driver", years: "2024" },
  { brand: "Cobra", model: "Darkspeed LS", type: "driver", years: "2024" },
  { brand: "Cobra", model: "Darkspeed Max", type: "driver", years: "2024" },
  { brand: "Cobra", model: "Aerojet", type: "driver", years: "2023" },
  { brand: "Cobra", model: "Aerojet LS", type: "driver", years: "2023" },
  { brand: "Cobra", model: "LTDx", type: "driver", years: "2022" },
  { brand: "Cobra", model: "KING Radspeed", type: "driver", years: "2021" },
  { brand: "Cobra", model: "Darkspeed", type: "fairway", years: "2024" },
  { brand: "Cobra", model: "Darkspeed", type: "hybrid", years: "2024" },
  { brand: "Cobra", model: "King Forged Tour", type: "iron", years: "2019-2024" },
  { brand: "Cobra", model: "King TEC", type: "iron", years: "2022-2024" },
  { brand: "Cobra", model: "Snakebite", type: "wedge", years: "2020-2024" },
  // --- CLEVELAND -------------------------------------------
  { brand: "Cleveland", model: "RTX 6 ZipCore", type: "wedge", years: "2022-2024" },
  { brand: "Cleveland", model: "RTX Full-Face 2", type: "wedge", years: "2022-2024" },
  { brand: "Cleveland", model: "CBX Full-Face 2", type: "wedge", years: "2022-2024" },
  { brand: "Cleveland", model: "RTX ZipCore", type: "wedge", years: "2020-2021" },
  { brand: "Cleveland", model: "Frontline Elite Elevado", type: "putter", years: "2022-2024" },
  // --- SRIXON ----------------------------------------------
  { brand: "Srixon", model: "ZX7 Mk II", type: "driver", years: "2022-2024" },
  { brand: "Srixon", model: "ZX5 Mk II", type: "driver", years: "2022-2024" },
  { brand: "Srixon", model: "ZX7", type: "driver", years: "2020-2021" },
  { brand: "Srixon", model: "ZX7 Mk II", type: "iron", years: "2022-2024" },
  { brand: "Srixon", model: "ZX5 Mk II", type: "iron", years: "2022-2024" },
  { brand: "Srixon", model: "ZX4 Mk II", type: "iron", years: "2022-2024" },
  { brand: "Srixon", model: "ZX7", type: "iron", years: "2020-2021" },
  { brand: "Srixon", model: "Z 785", type: "iron", years: "2019-2020" },
  // --- BRIDGESTONE -----------------------------------------
  { brand: "Bridgestone", model: "Tour B X", type: "driver", years: "2022-2024" },
  { brand: "Bridgestone", model: "Tour B JGR", type: "driver", years: "2020-2022" },
  { brand: "Bridgestone", model: "J225", type: "iron", years: "2022-2024" },
  // --- WILSON ----------------------------------------------
  { brand: "Wilson", model: "D9", type: "driver", years: "2021-2023" },
  { brand: "Wilson", model: "Dynapower Forged", type: "iron", years: "2022-2023" },
  { brand: "Wilson", model: "Staff Model CB", type: "iron", years: "2020-2023" },
  { brand: "Wilson", model: "Staff Model Blade", type: "iron", years: "2020-2023" },
  // --- ADAMS -----------------------------------------------
  { brand: "Adams", model: "Super S", type: "hybrid", years: "2014-2015" },
  { brand: "Adams", model: "Tight Lies", type: "fairway", years: "2013-2015" },
  // --- NIKE (pre-2016) -------------------------------------
  { brand: "Nike", model: "Vapor Fly Pro", type: "driver", years: "2016" },
  { brand: "Nike", model: "Vapor Speed", type: "driver", years: "2015" },
  { brand: "Nike", model: "VRS Covert 2.0", type: "driver", years: "2014" },
  { brand: "Nike", model: "Vapor Pro Combo", type: "iron", years: "2015" },
  { brand: "Nike", model: "VR_S Pro Combo", type: "iron", years: "2013-2014" },
  { brand: "Nike", model: "Method Mod 44", type: "putter", years: "2015" },
  // --- PXG -------------------------------------------------
  { brand: "PXG", model: "0311 XP GEN6", type: "iron", years: "2023-2024" },
  { brand: "PXG", model: "0311 GEN6", type: "iron", years: "2023-2024" },
  { brand: "PXG", model: "0211 GEN5", type: "iron", years: "2022-2024" },
  { brand: "PXG", model: "0317 X GEN4", type: "driver", years: "2022-2023" },
];

// Suggested slot names when adding a new club
export const CLUB_SLOT_NAMES = [
  "Driver",
  "3 Wood",
  "5 Wood",
  "7 Wood",
  "3 Hybrid",
  "4 Hybrid",
  "5 Hybrid",
  "4 Iron",
  "5 Iron",
  "6 Iron",
  "7 Iron",
  "8 Iron",
  "9 Iron",
  "Irons 5-PW",
  "Irons 4-PW",
  "Irons 5-GW",
  "Irons 4-GW",
  "PW",
  "GW (50 deg)",
  "GW (52 deg)",
  "SW (54 deg)",
  "SW (56 deg)",
  "LW (58 deg)",
  "LW (60 deg)",
  "Putter",
];

/** Return brands that fuzzy-match the input string */
export function matchBrands(input: string): string[] {
  const q = input.toLowerCase().trim();
  if (!q) return CLUB_BRANDS.slice() as string[];
  return (CLUB_BRANDS as readonly string[]).filter(b => b.toLowerCase().includes(q)).slice(0, 8);
}

/** Return models for a given brand, optionally filtered by query */
export function matchModels(brand: string, query?: string): ClubModel[] {
  const brandLower = brand.toLowerCase();
  const models = CLUB_MODELS.filter(m => m.brand.toLowerCase() === brandLower);
  if (!query) return models;
  const q = query.toLowerCase();
  return models.filter(m => m.model.toLowerCase().includes(q));
}

/** Format a model into a display spec string */
export function formatSpec(brand: string, model: string): string {
  return `${brand} ${model}`;
}
