export const CS16_MAPS = [
  'de_dust2',
  'de_inferno',
  'de_nuke',
  'de_train',
  'de_mirage',
  'de_tuscan',
  'de_cpl_mill',
] as const;

export type MapName = typeof CS16_MAPS[number];

export const MATCH_STATUS = {
  PENDING: 'PENDING',
  CHECK_IN: 'CHECK_IN',
  VETO: 'VETO',
  SERVER_START: 'SERVER_START',
  LIVE: 'LIVE',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED',
} as const;

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export const LOBBY_STATUS = {
  WAITING: 'WAITING',
  IN_QUEUE: 'IN_QUEUE',
  READY: 'READY',
  IN_MATCH: 'IN_MATCH',
} as const;

export type LobbyStatus = typeof LOBBY_STATUS[keyof typeof LOBBY_STATUS];

export const GAME_MODES = [
  { id: '5v5_CAP', name: '5v5 Captain', description: 'Captains pick teams' },
  { id: '5v5_AUTO', name: '5v5 Auto', description: 'Auto-balance by ELO' },
  { id: '1v1_AIM', name: '1v1 Aim', description: 'Duel mode' },
] as const;

export type GameMode = typeof GAME_MODES[number]['id'];

export const REGIONS = [
  { id: 'EU_WEST', name: 'Europe West', flag: '🇪🇺' },
  { id: 'EU_EAST', name: 'Europe East', flag: '🇪🇺' },
  { id: 'NA_EAST', name: 'North America East', flag: '🇺🇸' },
  { id: 'NA_WEST', name: 'North America West', flag: '🇺🇸' },
  { id: 'ASIA', name: 'Asia', flag: '🌏' },
  { id: 'OCEANIA', name: 'Oceania', flag: '🌏' },
  { id: 'SOUTH_AMERICA', name: 'South America', flag: '🌎' },
] as const;

export type Region = typeof REGIONS[number]['id'];

export const PENALTY_REASONS = {
  DODGE_MATCH: 'DODGE_MATCH',
  TOXICITY: 'TOXICITY',
  CHEAT: 'CHEAT',
  MANUAL_BAN: 'MANUAL_BAN',
} as const;

export type PenaltyReason = typeof PENALTY_REASONS[keyof typeof PENALTY_REASONS];

export const RANK_LEVELS = [
  { level: 1, name: 'Private', minElo: 0, maxElo: 499 },
  { level: 2, name: 'Corporal', minElo: 500, maxElo: 749 },
  { level: 3, name: 'Sergeant', minElo: 750, maxElo: 999 },
  { level: 4, name: 'Master Sergeant', minElo: 1000, maxElo: 1249 },
  { level: 5, name: 'Staff Sergeant', minElo: 1250, maxElo: 1499 },
  { level: 6, name: 'Sergeant First Class', minElo: 1500, maxElo: 1749 },
  { level: 7, name: 'Master Sergeant', minElo: 1750, maxElo: 1999 },
  { level: 8, name: 'First Sergeant', minElo: 2000, maxElo: 2249 },
  { level: 9, name: 'Sergeant Major', minElo: 2250, maxElo: 2499 },
  { level: 10, name: 'Command Sergeant Major', minElo: 2500, maxElo: 9999 },
] as const;

export type RankLevel = typeof RANK_LEVELS[number]['level'];

export const FACTION_SKINS = {
  CT: ['Seal Team 6', 'GSG-9', 'SAS', 'GIGN'],
  T: ['Phoenix Connexion', 'Leet Krew', 'Arctic Avengers', 'Guerilla Warfare'],
} as const;

export const CHECK_IN_TIME_SECONDS = 30;
export const VETO_TIME_PER_PICK_SECONDS = 30;
export const DODGE_COOLDOWN_MINUTES = 15;
export const ELO_K_FACTOR = 32;
export const ELO_RANGE_MATCHMAKING = 150;
