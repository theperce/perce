import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/steam';

/**
 * CS 1.6 Server API Integration
 * This endpoint handles communication from AMX Mod X plugin on game servers
 */

// Verify server API key
async function verifyServerApiKey(apiKey: string): Promise<{ valid: boolean; server?: any }> {
  const server = await prisma.serverPool.findUnique({
    where: { apiKey },
  });

  if (!server) {
    return { valid: false };
  }

  if (server.status !== 'ONLINE') {
    return { valid: false };
  }

  return { valid: true, server };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiKey, data } = body;

    // Verify API key for all actions except health check
    if (action !== 'health') {
      const verification = await verifyServerApiKey(apiKey);
      if (!verification.valid) {
        return NextResponse.json(
          { success: false, error: 'Invalid or inactive server API key' },
          { status: 401 }
        );
      }
    }

    switch (action) {
      case 'health':
        return handleHealthCheck();

      case 'players-check':
        return handlePlayersCheck(data, verification.server!);

      case 'live-score':
        return handleLiveScore(data, verification.server!);

      case 'match-end':
        return handleMatchEnd(data, verification.server!);

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Server API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 * Servers ping this endpoint to show they're online
 */
async function handleHealthCheck() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Platform API is healthy',
  });
}

/**
 * Players Check - Verify SteamIDs of players joining the server
 * Request: { matchToken: string, players: Array<{ steamId64: string, name: string }> }
 */
async function handlePlayersCheck(
  data: { matchToken: string; players: Array<{ steamId64: string; name: string }> },
  server: any
) {
  const { matchToken, players } = data;

  if (!matchToken || !players) {
    return NextResponse.json(
      { success: false, error: 'Missing matchToken or players' },
      { status: 400 }
    );
  }

  const match = await prisma.match.findUnique({
    where: { matchToken },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json(
      { success: false, error: 'Match not found' },
      { status: 404 }
    );
  }

  if (match.status !== 'SERVER_START' && match.status !== 'LIVE') {
    return NextResponse.json(
      { success: false, error: 'Match is not ready for players' },
      { status: 400 }
    );
  }

  // Get allowed player SteamIDs
  const allowedSteamIds = new Set(match.players.map(p => p.user.steamId));

  // Check each player
  const playerResults = players.map(player => {
    const isAllowed = allowedSteamIds.has(player.steamId64);
    const matchPlayer = match.players.find(p => p.user.steamId === player.steamId64);
    
    return {
      steamId64: player.steamId64,
      name: player.name,
      allowed: isAllowed,
      team: matchPlayer?.team || null,
    };
  });

  // Update connected status
  for (const player of playerResults.filter(p => p.allowed)) {
    const matchPlayer = match.players.find(p => p.user.steamId === player.steamId64);
    if (matchPlayer && !matchPlayer.connected) {
      await prisma.matchPlayer.update({
        where: { id: matchPlayer.id },
        data: { connected: true },
      });
    }
  }

  // If all players connected, update match status to LIVE
  const allConnected = playerResults.every(p => p.allowed);
  if (allConnected && match.status === 'SERVER_START') {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'LIVE', startedAt: new Date() },
    });
  }

  return NextResponse.json({
    success: true,
    matchId: match.id,
    selectedMap: match.selectedMap,
    players: playerResults,
  });
}

/**
 * Live Score - Real-time score updates during match
 * Request: { matchToken: string, teamAScore: number, teamBScore: number, currentRound: number }
 */
async function handleLiveScore(
  data: { matchToken: string; teamAScore: number; teamBScore: number; currentRound: number },
  server: any
) {
  const { matchToken, teamAScore, teamBScore, currentRound } = data;

  const match = await prisma.match.findUnique({
    where: { matchToken },
  });

  if (!match) {
    return NextResponse.json(
      { success: false, error: 'Match not found' },
      { status: 404 }
    );
  }

  // Update match scores
  await prisma.match.update({
    where: { id: match.id },
    data: {
      teamAScore,
      teamBScore,
    },
  });

  // Emit real-time update via WebSocket (would be implemented with socket.io)
  // This is a placeholder - actual implementation would use the matchmakingService
  console.log(`Live score update for match ${match.id}: ${teamAScore}-${teamBScore}`);

  return NextResponse.json({
    success: true,
    matchId: match.id,
    acknowledged: true,
  });
}

/**
 * Match End - Final match results and statistics
 * Request: { matchToken: string, teamAScore: number, teamBScore: number, playerStats: [...] }
 */
async function handleMatchEnd(
  data: {
    matchToken: string;
    teamAScore: number;
    teamBScore: number;
    playerStats: Array<{
      steamId64: string;
      kills: number;
      deaths: number;
      assists: number;
      headshots: number;
      damage: number;
      mvps: number;
    }>;
    hltvDemoUrl?: string;
  },
  server: any
) {
  const { matchToken, teamAScore, teamBScore, playerStats, hltvDemoUrl } = data;

  const match = await prisma.match.findUnique({
    where: { matchToken },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json(
      { success: false, error: 'Match not found' },
      { status: 404 }
    );
  }

  // Import matchmaking service to handle ELO calculation
  const { matchmakingService } = await import('@/websocket/matchmaking');

  // Prepare player stats with userIds
  const formattedPlayerStats = playerStats.map(stat => {
    const matchPlayer = match.players.find(p => p.user.steamId === stat.steamId64);
    if (!matchPlayer) {
      throw new Error(`Player with SteamID ${stat.steamId64} not found in match`);
    }

    return {
      userId: matchPlayer.userId,
      kills: stat.kills,
      deaths: stat.deaths,
      assists: stat.assists,
      headshots: stat.headshots,
      damage: stat.damage,
      mvps: stat.mvps,
    };
  });

  // Handle match result (this will update ELO, stats, etc.)
  await matchmakingService.handleMatchResult(match.id, {
    teamAScore,
    teamBScore,
    playerStats: formattedPlayerStats,
    hltvDemoUrl,
  });

  return NextResponse.json({
    success: true,
    matchId: match.id,
    processed: true,
    eloUpdated: true,
  });
}

// GET endpoint for server status check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'CS 1.6 Matchmaking Platform API',
    version: '1.0.0',
    endpoints: [
      'POST /api/server/auth - Authenticate server',
      'POST /api/server/players-check - Verify player access',
      'POST /api/server/live-score - Update live score',
      'POST /api/server/match-end - Submit match results',
    ],
  });
}
