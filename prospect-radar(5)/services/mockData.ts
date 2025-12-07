import { RawPlayerRow, AppConfig } from '../types';

// Simulating the "Config" Tab
export const MOCK_CONFIG: AppConfig = {
  seasonLengthNHL: 82,
  leagueFactors: {
    'NCAA': 0.41,
    'SHL': 0.78,
    'OHL': 0.30,
    'WHL': 0.29,
    'QMJHL': 0.29,
    'Liiga': 0.54,
    'USHL': 0.24,
    'KHL': 0.74,
    'MHL': 0.20,
    'Allsvenskan': 0.45
  }
};

// Simulating the "Players" Tab (Columns A-S)
export const MOCK_PLAYERS_RAW: RawPlayerRow[] = [
  { Tier: 1, AvgRank: 1.0, InTierRank: 1, V1Rank: 1, JohnRank: 1, Name: "Macklin Celebrini", Country: "CAN", League: "NCAA", GP: 38, G: 32, A: 32, P: 64, PPG: 1.68, Birthdate: "2006-06-13", Age: 17, Height: "6'0", Weight: 190, Shoots: "L", Position: "C" },
  { Tier: 1, AvgRank: 2.5, InTierRank: 2, V1Rank: 2, JohnRank: 3, Name: "Ivan Demidov", Country: "RUS", League: "MHL", GP: 30, G: 23, A: 37, P: 60, PPG: 2.00, Birthdate: "2005-12-10", Age: 18, Height: "5'11", Weight: 168, Shoots: "L", Position: "RW" },
  { Tier: 1, AvgRank: 3.2, InTierRank: 3, V1Rank: 3, JohnRank: 2, Name: "Artyom Levshunov", Country: "BLR", League: "NCAA", GP: 38, G: 9, A: 26, P: 35, PPG: 0.92, Birthdate: "2005-10-28", Age: 18, Height: "6'2", Weight: 208, Shoots: "R", Position: "RD" },
  { Tier: 2, AvgRank: 4.5, InTierRank: 1, V1Rank: 4, JohnRank: 5, Name: "Cayden Lindstrom", Country: "CAN", League: "WHL", GP: 32, G: 27, A: 19, P: 46, PPG: 1.44, Birthdate: "2006-02-03", Age: 18, Height: "6'3", Weight: 210, Shoots: "L", Position: "C" },
  { Tier: 2, AvgRank: 5.1, InTierRank: 2, V1Rank: 6, JohnRank: 4, Name: "Zeev Buium", Country: "USA", League: "NCAA", GP: 42, G: 11, A: 39, P: 50, PPG: 1.19, Birthdate: "2005-12-07", Age: 18, Height: "6'0", Weight: 183, Shoots: "L", Position: "LD" },
  { Tier: 2, AvgRank: 6.8, InTierRank: 3, V1Rank: 5, JohnRank: 8, Name: "Zayne Parekh", Country: "CAN", League: "OHL", GP: 66, G: 33, A: 63, P: 96, PPG: 1.45, Birthdate: "2006-02-15", Age: 18, Height: "6'0", Weight: 179, Shoots: "R", Position: "RD" },
  { Tier: 2, AvgRank: 7.2, InTierRank: 4, V1Rank: 7, JohnRank: 7, Name: "Sam Dickinson", Country: "CAN", League: "OHL", GP: 68, G: 18, A: 52, P: 70, PPG: 1.03, Birthdate: "2006-06-07", Age: 17, Height: "6'3", Weight: 199, Shoots: "L", Position: "LD" },
  { Tier: 3, AvgRank: 8.5, InTierRank: 1, V1Rank: 9, JohnRank: 6, Name: "Berkly Catton", Country: "CAN", League: "WHL", GP: 68, G: 54, A: 62, P: 116, PPG: 1.71, Birthdate: "2006-01-14", Age: 18, Height: "5'11", Weight: 170, Shoots: "L", Position: "C" },
  { Tier: 3, AvgRank: 9.9, InTierRank: 2, V1Rank: 8, JohnRank: 12, Name: "Tij Iginla", Country: "CAN", League: "WHL", GP: 64, G: 47, A: 37, P: 84, PPG: 1.31, Birthdate: "2006-08-04", Age: 17, Height: "6'0", Weight: 182, Shoots: "L", Position: "LW" },
  { Tier: 3, AvgRank: 10.5, InTierRank: 3, V1Rank: 12, JohnRank: 9, Name: "Konsta Helenius", Country: "FIN", League: "Liiga", GP: 51, G: 14, A: 22, P: 36, PPG: 0.71, Birthdate: "2006-05-11", Age: 17, Height: "5'11", Weight: 180, Shoots: "R", Position: "C" },
  { Tier: 3, AvgRank: 11.2, InTierRank: 4, V1Rank: 11, JohnRank: 10, Name: "Anton Silayev", Country: "RUS", League: "KHL", GP: 63, G: 3, A: 8, P: 11, PPG: 0.17, Birthdate: "2006-04-11", Age: 18, Height: "6'7", Weight: 211, Shoots: "L", Position: "LD" },
  { Tier: 4, AvgRank: 15.5, InTierRank: 1, V1Rank: 15, JohnRank: 18, Name: "Michael Brandsegg-Nygård", Country: "NOR", League: "Allsvenskan", GP: 41, G: 8, A: 10, P: 18, PPG: 0.44, Birthdate: "2005-10-05", Age: 18, Height: "6'1", Weight: 198, Shoots: "R", Position: "RW" },
  { Tier: 4, AvgRank: 18.2, InTierRank: 2, V1Rank: 19, JohnRank: 14, Name: "Cole Eiserman", Country: "USA", League: "USHL", GP: 24, G: 25, A: 9, P: 34, PPG: 1.42, Birthdate: "2006-08-29", Age: 17, Height: "6'0", Weight: 195, Shoots: "L", Position: "LW" },
  { Tier: 5, AvgRank: 24.1, InTierRank: 1, V1Rank: 22, JohnRank: 25, Name: "Aron Kiviharju", Country: "FIN", League: "Liiga", GP: 7, G: 1, A: 1, P: 2, PPG: 0.29, Birthdate: "2006-01-25", Age: 18, Height: "5'9", Weight: 170, Shoots: "L", Position: "LD" },
];