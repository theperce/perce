/**
 * ELO Rating System for CS 1.6 Matchmaking Platform
 * Implements Glicko-2 inspired algorithm with K-factor adjustment
 */

import { ELO_K_FACTOR } from './constants';

interface Player {
  elo: number;
  team: 'TEAM_A' | 'TEAM_B';
}

interface MatchResult {
  teamAScore: number;
  teamBScore: number;
  players: Player[];
}

/**
 * Calculate expected score for a player based on opponent's rating
 * Formula: E = 1 / (1 + 10^((Rb - Ra) / 400))
 */
export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  const ratingDiff = opponentElo - playerElo;
  return 1 / (1 + Math.pow(10, ratingDiff / 400));
}

/**
 * Calculate average ELO for a team
 */
export function calculateTeamAverageElo(players: Player[], team: 'TEAM_A' | 'TEAM_B'): number {
  const teamPlayers = players.filter(p => p.team === team);
  if (teamPlayers.length === 0) return 0;
  
  const totalElo = teamPlayers.reduce((sum, player) => sum + player.elo, 0);
  return Math.round(totalElo / teamPlayers.length);
}

/**
 * Calculate match outcome multiplier
 * Returns value between 0 and 1 based on margin of victory
 */
export function calculateVictoryMargin(teamAScore: number, teamBScore: number): number {
  const totalRounds = teamAScore + teamBScore;
  if (totalRounds === 0) return 0.5;
  
  const scoreDiff = Math.abs(teamAScore - teamBScore);
  const maxPossibleDiff = Math.max(teamAScore, teamBScore);
  
  // Base multiplier (win = 1, loss = 0)
  const baseMultiplier = teamAScore > teamBScore ? 1 : 0;
  
  // Add bonus for dominant performance (max +0.5)
  const dominanceBonus = (scoreDiff / maxPossibleDiff) * 0.5;
  
  return Math.min(1, baseMultiplier + dominanceBonus);
}

/**
 * Calculate ELO changes for all players in a match
 * Returns array of elo changes indexed by player
 */
export function calculateEloChanges(result: MatchResult): number[] {
  const { teamAScore, teamBScore, players } = result;
  
  if (teamAScore === teamBScore) {
    // Draw - minimal changes
    return players.map(() => 0);
  }
  
  const winningTeam = teamAScore > teamBScore ? 'TEAM_A' : 'TEAM_B';
  const losingTeam = teamAScore > teamBScore ? 'TEAM_B' : 'TEAM_A';
  
  const avgEloWinner = calculateTeamAverageElo(players, winningTeam);
  const avgEloLoser = calculateTeamAverageElo(players, losingTeam);
  
  const victoryMargin = calculateVictoryMargin(teamAScore, teamBScore);
  
  return players.map(player => {
    const isWinner = player.team === winningTeam;
    const avgOpponentElo = isWinner ? avgEloLoser : avgEloWinner;
    
    // Expected score based on team average ELO difference
    const expectedScore = calculateExpectedScore(avgEloWinner, avgEloLoser);
    
    // Actual score (1 for win, 0 for loss, adjusted by margin)
    const actualScore = isWinner ? victoryMargin : (1 - victoryMargin);
    
    // K-factor adjustment based on player experience (simplified)
    const kFactor = ELO_K_FACTOR;
    
    // Calculate ELO change
    const eloChange = Math.round(kFactor * (actualScore - expectedScore));
    
    // Ensure minimum change of ±1 for participation
    return isWinner ? Math.max(1, eloChange) : Math.min(-1, eloChange);
  });
}

/**
 * Check if players have similar ELO for matchmaking
 * Returns true if all players are within acceptable range
 */
export function canMatchPlayers(playerElos: number[], maxRange: number = 150): boolean {
  if (playerElos.length === 0) return false;
  
  const minElo = Math.min(...playerElos);
  const maxElo = Math.max(...playerElos);
  
  return (maxElo - minElo) <= maxRange;
}

/**
 * Calculate compatibility score between two teams for matchmaking
 * Higher score means better match (0-100)
 */
export function calculateMatchCompatibility(teamA: Player[], teamB: Player[]): number {
  if (teamA.length === 0 || teamB.length === 0) return 0;
  
  const avgA = calculateTeamAverageElo([...teamA, ...teamB], 'TEAM_A'); // Hack to reuse function
  const avgB = calculateTeamAverageElo(teamB, 'TEAM_B');
  
  const eloDiff = Math.abs(avgA - avgB);
  
  // Perfect match = 100, decreases as ELO difference increases
  // 0 difference = 100, 300+ difference = 0
  const compatibility = Math.max(0, 100 - (eloDiff / 3));
  
  return Math.round(compatibility);
}

/**
 * Determine rank level from ELO
 */
export function getRankLevelFromElo(elo: number): number {
  const RANK_LEVELS = [
    { level: 1, minElo: 0, maxElo: 499 },
    { level: 2, minElo: 500, maxElo: 749 },
    { level: 3, minElo: 750, maxElo: 999 },
    { level: 4, minElo: 1000, maxElo: 1249 },
    { level: 5, minElo: 1250, maxElo: 1499 },
    { level: 6, minElo: 1500, maxElo: 1749 },
    { level: 7, minElo: 1750, maxElo: 1999 },
    { level: 8, minElo: 2000, maxElo: 2249 },
    { level: 9, minElo: 2250, maxElo: 2499 },
    { level: 10, minElo: 2500, maxElo: 9999 },
  ];
  
  const rank = RANK_LEVELS.find(r => elo >= r.minElo && elo <= r.maxElo);
  return rank?.level || 1;
}

/**
 * Get rank name from level
 */
export function getRankName(level: number): string {
  const RANK_NAMES: Record<number, string> = {
    1: 'Private',
    2: 'Corporal',
    3: 'Sergeant',
    4: 'Master Sergeant',
    5: 'Staff Sergeant',
    6: 'Sergeant First Class',
    7: 'Master Sergeant',
    8: 'First Sergeant',
    9: 'Sergeant Major',
    10: 'Command Sergeant Major',
  };
  
  return RANK_NAMES[level] || 'Private';
}
