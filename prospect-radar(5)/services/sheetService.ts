
import { RawPlayerRow, Player, AppConfig, ScoutingReport, SkillRatings, PlayerNote, IntelStats } from '../types';

const SHEET_ID = '1sExxYG0OZi74d3Ne7lIH6_Fdn3Eoyz6_lFk-eyAGUEY';

// Local Storage Keys
const TAGS_STORAGE_KEY = 'prospect_radar_tags';
const WATCHLIST_STORAGE_KEY = 'prospect_radar_watchlist';
const SCOUTING_STORAGE_KEY = 'prospect_radar_scouting';

// Default Skills
const DEFAULT_SKILLS: SkillRatings = {
  Skating: 50,
  Shooting: 50,
  Hands: 50,
  Passing: 50,
  Physicality: 50,
  IQ: 50,
  Defense: 50,
  Compete: 50
};

const getHelperData = () => {
  const tags = JSON.parse(localStorage.getItem(TAGS_STORAGE_KEY) || '{}');
  const watched = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
  const scouting = JSON.parse(localStorage.getItem(SCOUTING_STORAGE_KEY) || '{}');
  return { tags, watched, scouting };
};

// ----------------------------------------------------------------------
// CSV PARSING UTILITIES
// ----------------------------------------------------------------------

// Robust CSV parser to handle quoted strings containing commas
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuote) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuote = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\n' || char === '\r') {
        if (currentVal || currentRow.length > 0) {
          currentRow.push(currentVal.trim());
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentVal += char;
      }
    }
  }
  // Push last row if exists
  if (currentRow.length > 0 || currentVal) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
};

const fetchSheetData = async (sheetName: string): Promise<string[][]> => {
  // Use Google Visualization API to get CSV
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch sheet: ${sheetName}`);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error loading ${sheetName}:`, error);
    return [];
  }
};

// ----------------------------------------------------------------------
// DATA MAPPING
// ----------------------------------------------------------------------

const mapConfig = (rows: string[][]): AppConfig => {
  const config: AppConfig = {
    seasonLengthNHL: 82,
    leagueFactors: {}
  };

  // Scan rows for specific keys
  let leagueStartRow = -1;

  rows.forEach((row, index) => {
    if (!row[0]) return;
    
    // Check A1/B1
    if (row[0].trim() === 'SeasonLengthNHL' && row[1]) {
      config.seasonLengthNHL = parseFloat(row[1]);
    }

    // Identify start of league table
    if (row[0].trim() === 'League' && row[1] === 'NHLeFactor') {
      leagueStartRow = index + 1;
    }

    // Process League rows if we are past the header
    if (leagueStartRow > 0 && index >= leagueStartRow) {
      const league = row[0];
      const factor = parseFloat(row[1]);
      if (league && !isNaN(factor)) {
        config.leagueFactors[league] = factor;
      }
    }
  });

  return config;
};

const mapPlayerRow = (row: string[]): RawPlayerRow | null => {
  // Ensure we have enough columns (A-S is 19 columns)
  // We can be lenient if trailing empty cols are missing, but need at least up to Name (F)
  if (!row || row.length < 6) return null;

  try {
    return {
      Tier: parseInt(row[0]) || 0,        // A
      AvgRank: parseFloat(row[1]) || 0,   // B
      InTierRank: parseInt(row[2]) || 0,  // C
      V1Rank: parseInt(row[3]) || 0,      // D
      JohnRank: parseInt(row[4]) || 0,    // E
      Name: row[5] || 'Unknown',          // F
      Country: row[6] || '',              // G
      League: row[7] || '',               // H
      GP: parseInt(row[8]) || 0,          // I
      G: parseInt(row[9]) || 0,           // J
      A: parseInt(row[10]) || 0,          // K
      P: parseInt(row[11]) || 0,          // L
      PPG: parseFloat(row[12]) || 0,      // M
      Birthdate: row[13] || '',           // N
      Age: parseInt(row[14]) || 0,        // O
      Height: row[15] || '',              // P
      Weight: parseInt(row[16]) || 0,     // Q
      Shoots: (row[17] as 'L'|'R') || 'L',// R
      Position: row[18] || ''             // S
    };
  } catch (e) {
    console.warn('Failed to parse row', row, e);
    return null;
  }
};

// ----------------------------------------------------------------------
// DERIVED METRIC CALCULATIONS
// ----------------------------------------------------------------------

const calculateNHLe = (player: RawPlayerRow, config: AppConfig): number => {
  const factor = config.leagueFactors[player.League] || 0.25; // Default safe fallback
  const nhle = player.PPG * factor * config.seasonLengthNHL;
  return parseFloat(nhle.toFixed(1));
};

const calculateStatsScore = (nhle: number, maxNHLe: number): number => {
  if (maxNHLe === 0) return 0;
  const score = (nhle / maxNHLe) * 100;
  return Math.min(100, Math.max(0, parseFloat(score.toFixed(1))));
};

const calculateRankScore = (rank: number, maxRank: number): number => {
  if (maxRank === 0) return 0;
  // Inverse rank: 1 is best.
  // Formula: 100 - (rank / maxRank * 100)
  // We normalize slightly loosely so rank 1 is closer to 100
  const score = 100 - ((rank / (maxRank * 1.1)) * 100);
  return Math.min(100, Math.max(0, parseFloat(score.toFixed(1))));
};

const calculateComposite = (statsScore: number, rankScore: number): number => {
  const composite = (statsScore * 0.5) + (rankScore * 0.5); 
  return parseFloat(composite.toFixed(1));
};

// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------

export const getProcessedPlayers = async (): Promise<Player[]> => {
  // 1. Fetch Raw Data
  const [playerRows, configRows] = await Promise.all([
    fetchSheetData('Players'),
    fetchSheetData('Config')
  ]);

  // 2. Map Config
  const config = mapConfig(configRows);

  // 3. Map Players (skip header row 0)
  const rawPlayers = playerRows
    .slice(1) 
    .map(mapPlayerRow)
    .filter((p): p is RawPlayerRow => p !== null && p.Name !== 'Unknown');

  if (rawPlayers.length === 0) {
    return [];
  }

  // 4. Merge Helper Data & Apply LIVE STAT OVERRIDES
  const { tags, watched, scouting } = getHelperData();
  
  // We need to apply overrides BEFORE calculating derived metrics (NHLe)
  const playersWithOverrides = rawPlayers.map(p => {
    const playerScouting: ScoutingReport = scouting[p.Name] || { skills: DEFAULT_SKILLS, notes: [] };
    let hasLiveStats = false;
    
    if (playerScouting.liveStats) {
       // OVERRIDE SHEET DATA
       p.GP = playerScouting.liveStats.GP;
       p.G = playerScouting.liveStats.G;
       p.A = playerScouting.liveStats.A;
       p.P = playerScouting.liveStats.P;
       p.PPG = p.GP > 0 ? parseFloat((p.P / p.GP).toFixed(2)) : 0;
       hasLiveStats = true;
    }

    return { p, playerScouting, hasLiveStats };
  });

  // 5. Calculate Derived Metrics (using potentially overridden stats)
  const maxNHLe = Math.max(...playersWithOverrides.map(item => calculateNHLe(item.p, config)));
  const maxRank = Math.max(...playersWithOverrides.map(item => item.p.AvgRank));

  return playersWithOverrides.map(({ p, playerScouting, hasLiveStats }) => {
    const nhle = calculateNHLe(p, config);
    const statsScore = calculateStatsScore(nhle, maxNHLe);
    const rankScore = calculateRankScore(p.AvgRank, maxRank);
    const compositeScore = calculateComposite(statsScore, rankScore);
    
    return {
      ...p,
      NHLe: nhle,
      StatsScore: statsScore,
      RankScore: rankScore,
      CompositeScore: compositeScore,
      tags: tags[p.Name] || [],
      isWatched: watched.includes(p.Name),
      scouting: playerScouting,
      hasLiveStats: hasLiveStats
    };
  });
};

// Helper Tab Functions
export const toggleWatchPlayer = (playerName: string) => {
  const { watched } = getHelperData();
  let newWatched = [];
  if (watched.includes(playerName)) {
    newWatched = watched.filter((n: string) => n !== playerName);
  } else {
    newWatched = [...watched, playerName];
  }
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatched));
  window.dispatchEvent(new Event('storage'));
};

export const addTagToPlayer = (playerName: string, tag: string) => {
  const { tags } = getHelperData();
  const playerTags = tags[playerName] || [];
  if (!playerTags.includes(tag)) {
    tags[playerName] = [...playerTags, tag];
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new Event('storage'));
  }
};

export const removeTagFromPlayer = (playerName: string, tag: string) => {
    const { tags } = getHelperData();
    const playerTags = tags[playerName] || [];
    tags[playerName] = playerTags.filter((t: string) => t !== tag);
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new Event('storage'));
};

// Scouting Report Functions

export const savePlayerSkills = (playerName: string, skills: SkillRatings) => {
  const { scouting } = getHelperData();
  const existing = scouting[playerName] || { skills: DEFAULT_SKILLS, notes: [] };
  scouting[playerName] = { ...existing, skills };
  localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(scouting));
  window.dispatchEvent(new Event('storage'));
};

export const savePlayerStats = (playerName: string, stats: IntelStats) => {
    const { scouting } = getHelperData();
    const existing = scouting[playerName] || { skills: DEFAULT_SKILLS, notes: [] };
    scouting[playerName] = { ...existing, liveStats: stats };
    localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(scouting));
    window.dispatchEvent(new Event('storage'));
};

export const addPlayerNote = (playerName: string, text: string) => {
  const { scouting } = getHelperData();
  const existing = scouting[playerName] || { skills: DEFAULT_SKILLS, notes: [] };
  
  const newNote: PlayerNote = {
    id: Date.now().toString(),
    text,
    date: new Date().toLocaleDateString()
  };

  scouting[playerName] = { ...existing, notes: [newNote, ...existing.notes] };
  localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(scouting));
  window.dispatchEvent(new Event('storage'));
};

export const deletePlayerNote = (playerName: string, noteId: string) => {
  const { scouting } = getHelperData();
  const existing = scouting[playerName] || { skills: DEFAULT_SKILLS, notes: [] };
  
  scouting[playerName] = { 
    ...existing, 
    notes: existing.notes.filter((n: PlayerNote) => n.id !== noteId) 
  };
  localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(scouting));
  window.dispatchEvent(new Event('storage'));
};
