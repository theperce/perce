import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../lib/steam';
import { MATCH_STATUS, LOBBY_STATUS, CHECK_IN_TIME_SECONDS, DODGE_COOLDOWN_MINUTES } from '../lib/constants';
import { calculateEloChanges } from '../lib/elo';

interface MatchmakingQueue {
  lobbyId: string;
  mode: string;
  region: string;
  averageElo: number;
  playerCount: number;
  timestamp: Date;
}

interface ActiveMatch {
  matchId: string;
  lobbyIds: string[];
  checkInDeadline: Date;
  checkedInPlayers: Set<string>;
}

interface VetoSession {
  matchId: string;
  currentPickerIndex: number;
  bannedMaps: string[];
  pickedMap: string | null;
  deadline: Date;
}

export class MatchmakingService {
  private queue: Map<string, MatchmakingQueue> = new Map();
  private activeMatches: Map<string, ActiveMatch> = new Map();
  private vetoSessions: Map<string, VetoSession> = new Map();
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-lobby', (lobbyId: string) => {
        socket.join(`lobby:${lobbyId}`);
      });

      socket.on('join-match', (matchId: string) => {
        socket.join(`match:${matchId}`);
      });

      socket.on('ready-check', async (data: { matchId: string; userId: string }) => {
        await this.handleReadyCheck(data.matchId, data.userId);
      });

      socket.on('veto-pick', async (data: { matchId: string; mapName: string; action: 'ban' | 'pick' }) => {
        await this.handleVetoPick(data.matchId, data.mapName, data.action);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Start matchmaking loop
    setInterval(() => this.processMatchmaking(), 2000);
    
    // Check for expired check-ins
    setInterval(() => this.checkExpiredCheckIns(), 1000);
    
    // Check for expired vetoes
    setInterval(() => this.checkExpiredVetoes(), 1000);

    return this.io;
  }

  async addToQueue(lobbyId: string, mode: string, region: string): Promise<void> {
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!lobby) throw new Error('Lobby not found');

    const averageElo = Math.round(
      lobby.members.reduce((sum, m) => sum + m.user.elo, 0) / lobby.members.length
    );

    this.queue.set(lobbyId, {
      lobbyId,
      mode,
      region,
      averageElo,
      playerCount: lobby.members.length,
      timestamp: new Date(),
    });

    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: LOBBY_STATUS.IN_QUEUE },
    });

    this.io?.to(`lobby:${lobbyId}`).emit('queue-status', {
      status: 'in_queue',
      position: this.getQueuePosition(lobbyId),
    });
  }

  removeFromQueue(lobbyId: string): void {
    this.queue.delete(lobbyId);
  }

  getQueuePosition(lobbyId: string): number {
    const targetLobby = this.queue.get(lobbyId);
    if (!targetLobby) return -1;

    const compatibleLobbies = Array.from(this.queue.values()).filter(
      l => l.mode === targetLobby.mode &&
           l.region === targetLobby.region &&
           Math.abs(l.averageElo - targetLobby.averageElo) <= 150
    );

    return compatibleLobbies.findIndex(l => l.lobbyId === lobbyId) + 1;
  }

  private async processMatchmaking(): Promise<void> {
    if (this.queue.size < 2) return;

    const queues = Array.from(this.queue.entries());
    
    for (let i = 0; i < queues.length; i++) {
      const [lobbyId1, queue1] = queues[i];
      
      for (let j = i + 1; j < queues.length; j++) {
        const [lobbyId2, queue2] = queues[j];

        // Check compatibility
        if (queue1.mode !== queue2.mode || queue1.region !== queue2.region) continue;
        if (Math.abs(queue1.averageElo - queue2.averageElo) > 150) continue;

        // Check total player count (should be 10 for 5v5)
        const totalPlayers = queue1.playerCount + queue2.playerCount;
        if (totalPlayers !== 10) continue;

        // Found a match!
        await this.createMatch(lobbyId1, lobbyId2);
        
        // Remove from queue
        this.queue.delete(lobbyId1);
        this.queue.delete(lobbyId2);
        
        break;
      }
    }
  }

  private async createMatch(lobbyId1: string, lobbyId2: string): Promise<void> {
    // Find available server
    const server = await prisma.serverPool.findFirst({
      where: {
        isBusy: false,
        status: 'ONLINE',
      },
    });

    if (!server) {
      console.error('No available server for match');
      return;
    }

    // Create match record
    const match = await prisma.match.create({
      data: {
        serverId: server.id,
        status: MATCH_STATUS.CHECK_IN,
        matchToken: crypto.randomUUID(),
        rconPassword: crypto.randomUUID().slice(0, 8),
      },
    });

    // Get lobby members
    const lobby1 = await prisma.lobby.findUnique({
      where: { id: lobbyId1 },
      include: { members: { include: { user: true } } },
    });

    const lobby2 = await prisma.lobby.findUnique({
      where: { id: lobbyId2 },
      include: { members: { include: { user: true } } },
    });

    if (!lobby1 || !lobby2) return;

    // Add players to match
    const teamAPlayers = lobby1.members.map(m => ({
      matchId: match.id,
      userId: m.userId,
      team: 'TEAM_A' as const,
    }));

    const teamBPlayers = lobby2.members.map(m => ({
      matchId: match.id,
      userId: m.userId,
      team: 'TEAM_B' as const,
    }));

    await prisma.matchPlayer.createMany({
      data: [...teamAPlayers, ...teamBPlayers],
    });

    // Update lobbies
    await prisma.lobby.updateMany({
      where: { id: { in: [lobbyId1, lobbyId2] } },
      data: { status: LOBBY_STATUS.IN_MATCH },
    });

    // Mark server as busy
    await prisma.serverPool.update({
      where: { id: server.id },
      data: {
        isBusy: true,
        currentMatch: match.id,
      },
    });

    // Create active match tracking
    const allPlayerIds = [...lobby1.members, ...lobby2.members].map(m => m.userId);
    this.activeMatches.set(match.id, {
      matchId: match.id,
      lobbyIds: [lobbyId1, lobbyId2],
      checkInDeadline: new Date(Date.now() + CHECK_IN_TIME_SECONDS * 1000),
      checkedInPlayers: new Set(),
    });

    // Notify players
    const roomName = `match:${match.id}`;
    this.io?.to(roomName).emit('match-found', {
      matchId: match.id,
      checkInTime: CHECK_IN_TIME_SECONDS,
      map: 'TBD',
    });

    // Play sound notification
    this.io?.to(roomName).emit('play-sound', { sound: 'match_found' });
  }

  private async handleReadyCheck(matchId: string, userId: string): Promise<void> {
    const activeMatch = this.activeMatches.get(matchId);
    if (!activeMatch) return;

    activeMatch.checkedInPlayers.add(userId);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!match) return;

    const allPlayerIds = match.players.map(p => p.userId);
    const allCheckedIn = allPlayerIds.every(id => activeMatch.checkedInPlayers.has(id));

    if (allCheckedIn) {
      // All players ready, start veto phase
      await this.startVetoPhase(matchId);
    } else {
      // Notify about ready status
      this.io?.to(`match:${matchId}`).emit('check-in-progress', {
        checkedIn: activeMatch.checkedInPlayers.size,
        total: allPlayerIds.length,
      });
    }
  }

  private async checkExpiredCheckIns(): Promise<void> {
    const now = new Date();
    
    for (const [matchId, activeMatch] of this.activeMatches.entries()) {
      if (now > activeMatch.checkInDeadline) {
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { players: { include: { user: true } } },
        });

        if (!match) continue;

        const allPlayerIds = match.players.map(p => p.userId);
        const missingPlayers = allPlayerIds.filter(id => !activeMatch.checkedInPlayers.has(id));

        if (missingPlayers.length > 0) {
          // Cancel match and penalize missing players
          await this.cancelMatch(matchId, missingPlayers);
        }
      }
    }
  }

  private async cancelMatch(matchId: string, dodgerIds: string[]): Promise<void> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { server: true },
    });

    if (!match) return;

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: MATCH_STATUS.CANCELLED },
    });

    // Free server
    await prisma.serverPool.update({
      where: { id: match.serverId },
      data: {
        isBusy: false,
        currentMatch: null,
      },
    });

    // Penalize dodgers
    for (const userId of dodgerIds) {
      await prisma.penaltyHistory.create({
        data: {
          userId,
          reason: 'DODGE_MATCH',
          durationMinutes: DODGE_COOLDOWN_MINUTES,
          expiresAt: new Date(Date.now() + DODGE_COOLDOWN_MINUTES * 60 * 1000),
          isActive: true,
        },
      });
    }

    // Notify players
    this.io?.to(`match:${matchId}`).emit('match-cancelled', {
      reason: 'Players failed to check in',
      dodgers: dodgerIds,
    });

    // Clean up
    this.activeMatches.delete(matchId);
  }

  private async startVetoPhase(matchId: string): Promise<void> {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: MATCH_STATUS.VETO },
    });

    const players = await prisma.matchPlayer.findMany({
      where: { matchId },
      include: { user: true },
      orderBy: { user: { elo: 'desc' } },
    });

    // Top 2 ELO players are captains
    const captain1 = players[0];
    const captain2 = players[1];

    // Initialize veto session
    this.vetoSessions.set(matchId, {
      matchId,
      currentPickerIndex: 0,
      bannedMaps: [],
      pickedMap: null,
      deadline: new Date(Date.now() + 30000),
    });

    this.io?.to(`match:${matchId}`).emit('veto-start', {
      captains: [captain1.user, captain2.user],
      maps: ['de_dust2', 'de_inferno', 'de_nuke', 'de_train', 'de_mirage', 'de_tuscan', 'de_cpl_mill'],
    });
  }

  private async handleVetoPick(matchId: string, mapName: string, action: 'ban' | 'pick'): Promise<void> {
    const vetoSession = this.vetoSessions.get(matchId);
    if (!vetoSession) return;

    // Validate action
    if (vetoSession.bannedMaps.includes(mapName)) return;
    if (vetoSession.pickedMap) return;

    if (action === 'pick') {
      vetoSession.pickedMap = mapName;
      
      // Update match with selected map
      await prisma.match.update({
        where: { id: matchId },
        data: {
          selectedMap: mapName,
          status: MATCH_STATUS.SERVER_START,
        },
      });

      // Notify players and send server connect info
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { server: true, players: { include: { user: true } } },
      });

      if (match) {
        const connectCommand = `connect ${match.server.ip}:${match.server.port}; password ${match.rconPassword}`;
        
        this.io?.to(`match:${matchId}`).emit('server-ready', {
          map: mapName,
          connectCommand,
          serverIp: match.server.ip,
          serverPort: match.server.port,
          password: match.rconPassword,
        });

        this.io?.to(`match:${matchId}`).emit('play-sound', { sound: 'round_start' });
      }

      this.vetoSessions.delete(matchId);
    } else {
      // Ban
      vetoSession.bannedMaps.push(mapName);
      
      await prisma.matchVeto.create({
        data: {
          matchId,
          mapName,
          vetoOrder: vetoSession.bannedMaps.length,
          isBan: true,
        },
      });

      // Check if only one map remains
      const allMaps = ['de_dust2', 'de_inferno', 'de_nuke', 'de_train', 'de_mirage', 'de_tuscan', 'de_cpl_mill'];
      const remainingMaps = allMaps.filter(m => !vetoSession.bannedMaps.includes(m));

      if (remainingMaps.length === 1) {
        // Auto-pick last remaining map
        await this.handleVetoPick(matchId, remainingMaps[0], 'pick');
      } else {
        // Next captain's turn
        vetoSession.currentPickerIndex = (vetoSession.currentPickerIndex + 1) % 2;
        vetoSession.deadline = new Date(Date.now() + 30000);

        this.io?.to(`match:${matchId}`).emit('veto-update', {
          bannedMaps: vetoSession.bannedMaps,
          currentPickerIndex: vetoSession.currentPickerIndex,
        });
      }
    }
  }

  private async checkExpiredVetoes(): Promise<void> {
    const now = new Date();
    
    for (const [matchId, vetoSession] of this.vetoSessions.entries()) {
      if (now > vetoSession.deadline) {
        // Auto-ban random remaining map
        const allMaps = ['de_dust2', 'de_inferno', 'de_nuke', 'de_train', 'de_mirage', 'de_tuscan', 'de_cpl_mill'];
        const remainingMaps = allMaps.filter(m => !vetoSession.bannedMaps.includes(m));
        
        if (remainingMaps.length > 1) {
          const randomMap = remainingMaps[Math.floor(Math.random() * remainingMaps.length)];
          await this.handleVetoPick(matchId, randomMap, 'ban');
        } else if (remainingMaps.length === 1) {
          await this.handleVetoPick(matchId, remainingMaps[0], 'pick');
        }
      }
    }
  }

  async handleMatchResult(matchId: string, resultData: {
    teamAScore: number;
    teamBScore: number;
    playerStats: Array<{
      userId: string;
      kills: number;
      deaths: number;
      assists: number;
      headshots: number;
      damage: number;
      mvps: number;
    }>;
    hltvDemoUrl?: string;
  }): Promise<void> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: { include: { user: true } },
        server: true,
      },
    });

    if (!match) throw new Error('Match not found');

    // Update match record
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MATCH_STATUS.FINISHED,
        teamAScore: resultData.teamAScore,
        teamBScore: resultData.teamBScore,
        hltvDemoUrl: resultData.hltvDemoUrl,
        finishedAt: new Date(),
      },
    });

    // Update player stats and calculate ELO
    const players = match.players.map(p => ({
      elo: p.user.elo,
      team: p.team,
    }));

    const eloChanges = calculateEloChanges({
      teamAScore: resultData.teamAScore,
      teamBScore: resultData.teamBScore,
      players,
    });

    // Update each player
    for (let i = 0; i < match.players.length; i++) {
      const matchPlayer = match.players[i];
      const stats = resultData.playerStats.find(s => s.userId === matchPlayer.userId);
      const eloChange = eloChanges[i];

      await prisma.matchPlayer.update({
        where: { id: matchPlayer.id },
        data: {
          kills: stats?.kills || 0,
          deaths: stats?.deaths || 0,
          assists: stats?.assists || 0,
          headshots: stats?.headshots || 0,
          damage: stats?.damage || 0,
          mvps: stats?.mvps || 0,
          eloChange,
          connected: true,
        },
      });

      // Update user ELO
      const newElo = Math.max(0, matchPlayer.user.elo + eloChange);
      const newRankLevel = this.calculateRankLevel(newElo);

      await prisma.user.update({
        where: { id: matchPlayer.userId },
        data: {
          elo: newElo,
          rankLevel: newRankLevel,
        },
      });
    }

    // Free server
    await prisma.serverPool.update({
      where: { id: match.serverId },
      data: {
        isBusy: false,
        currentMatch: null,
      },
    });

    // Notify players
    this.io?.to(`match:${matchId}`).emit('match-finished', {
      teamAScore: resultData.teamAScore,
      teamBScore: resultData.teamBScore,
      playerStats: resultData.playerStats,
      eloChanges: match.players.map((p, i) => ({
        userId: p.userId,
        change: eloChanges[i],
        newElo: p.user.elo + eloChanges[i],
      })),
    });

    this.activeMatches.delete(matchId);
  }

  private calculateRankLevel(elo: number): number {
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
}

// Singleton instance
export const matchmakingService = new MatchmakingService();
