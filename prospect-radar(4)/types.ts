
// Maps strictly to Columns A-S in 'Players' sheet
export interface RawPlayerRow {
  Tier: number;       // A
  AvgRank: number;    // B
  InTierRank: number; // C
  V1Rank: number;     // D
  JohnRank: number;   // E
  Name: string;       // F (Primary Key effectively)
  Country: string;    // G
  League: string;     // H
  GP: number;         // I
  G: number;          // J
  A: number;          // K
  P: number;          // L
  PPG: number;        // M
  Birthdate: string;  // N
  Age: number;        // O
  Height: string;     // P (e.g. "6'0")
  Weight: number;     // Q (lbs)
  Shoots: 'L' | 'R';  // R
  Position: string;   // S
}

// Maps strictly to Columns T-W (Derived Metrics)
export interface DerivedMetrics {
  NHLe: number;           // T
  StatsScore: number;     // U
  RankScore: number;      // V
  CompositeScore: number; // W
}

// Scouting Data (Stored in LocalStorage Helper Tab)
export interface SkillRatings {
  Skating: number;
  Shooting: number;
  Hands: number;
  Passing: number;
  Physicality: number;
  IQ: number;
  Defense: number;
  Compete: number;
}

export interface PlayerNote {
  id: string;
  text: string;
  date: string;
}

// AI Intel Types
export interface IntelStats {
  GP: number;
  G: number;
  A: number;
  P: number;
}

export interface ScoutingReport {
  skills: SkillRatings;
  notes: PlayerNote[];
  liveStats?: IntelStats; // Optional override from AI
}

// The full application entity
export interface Player extends RawPlayerRow, DerivedMetrics {
  // Helpers not in main sheet, but stored in "Helper Tabs" (simulated via LocalStorage)
  isWatched: boolean;
  tags: string[];
  scouting: ScoutingReport;
  hasLiveStats: boolean; // Flag for UI
}

export interface ConfigLeague {
  name: string;
  factor: number;
}

export interface AppConfig {
  seasonLengthNHL: number;
  leagueFactors: Record<string, number>;
}

export type SortField = 'CompositeScore' | 'AvgRank' | 'Tier' | 'NHLe' | 'PPG';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  minTier: number;
  maxTier: number;
  leagues: string[];
  positions: string[];
  searchQuery: string;
  minComposite: number;
}

export interface IntelResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
  suggestedSkills?: SkillRatings;
  foundStats?: IntelStats;
}
