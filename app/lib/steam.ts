import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Convert SteamID64 to SteamID32 format
 * Example: 76561198012345678 -> STEAM_1:0:12345678
 */
export function steamId64To32(steamId64: string): string {
  const id = BigInt(steamId64);
  const baseId = id - BigInt('76561197960265728');
  const authServer = Number(baseId % 2n);
  const authId = Number(baseId / 2n);
  return `STEAM_1:${authServer}:${authId}`;
}

/**
 * Convert SteamID32 to SteamID64 format
 * Example: STEAM_1:0:12345678 -> 76561198012345678
 */
export function steamId32To64(steamId32: string): string {
  const parts = steamId32.split(':');
  if (parts.length !== 3) throw new Error('Invalid SteamID32 format');
  
  const authServer = parseInt(parts[1], 10);
  const authId = parseInt(parts[2], 10);
  
  const baseId = BigInt(authId * 2 + authServer);
  const steamId64 = baseId + BigInt('76561197960265728');
  
  return steamId64.toString();
}

/**
 * Validate SteamID64 format
 */
export function isValidSteamId64(steamId64: string): boolean {
  return /^7656\d{12,}$/.test(steamId64);
}

/**
 * Get Steam profile URL from SteamID64
 */
export function getSteamProfileUrl(steamId64: string): string {
  return `https://steamcommunity.com/profiles/${steamId64}`;
}

/**
 * Get Steam avatar URL with custom size
 * Sizes: small (32x32), medium (64x64), full (184x184)
 */
export function getSteamAvatarUrl(steamId64: string, size: 'small' | 'medium' | 'full' = 'medium'): string {
  // Default avatar fallback
  const defaultAvatar = 'https://avatars.cloudflare.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
  
  // In production, you would fetch the actual avatar from Steam API
  // For now, return a placeholder based on SteamID
  return defaultAvatar;
}

/**
 * Check if user has active penalty/ban
 */
export async function checkUserPenalty(userId: string): Promise<{
  isBanned: boolean;
  reason?: string;
  expiresAt?: Date | null;
}> {
  const penalty = await prisma.penaltyHistory.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null }, // Permanent ban
        { expiresAt: { gt: new Date() } }, // Temporary ban not expired
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  
  if (!penalty) {
    return { isBanned: false };
  }
  
  return {
    isBanned: true,
    reason: penalty.reason,
    expiresAt: penalty.expiresAt,
  };
}

/**
 * Create penalty for user
 */
export async function createUserPenalty(
  userId: string,
  reason: string,
  durationMinutes: number
): Promise<void> {
  const expiresAt = durationMinutes > 0
    ? new Date(Date.now() + durationMinutes * 60 * 1000)
    : null;
  
  await prisma.penaltyHistory.create({
    data: {
      userId,
      reason,
      durationMinutes,
      expiresAt,
      isActive: true,
    },
  });
  
  // Update user ban status if permanent
  if (durationMinutes === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        banUntil: null,
      },
    });
  }
}

/**
 * Get or create user from Steam authentication
 */
export async function findOrCreateUser(steamData: {
  steamId64: string;
  name: string;
  avatar?: string;
}): Promise<{
  id: string;
  steamId: string;
  steamId32: string;
  name: string;
  avatar: string | null;
  elo: number;
  rankLevel: number;
  isBanned: boolean;
}> {
  const steamId32 = steamId64To32(steamData.steamId64);
  
  let user = await prisma.user.findUnique({
    where: { steamId: steamData.steamId64 },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        steamId: steamData.steamId64,
        steamId32,
        name: steamData.name,
        avatar: steamData.avatar || null,
        elo: 1000,
        rankLevel: 1,
        isBanned: false,
      },
    });
  } else {
    // Update name and avatar if changed
    if (user.name !== steamData.name || user.avatar !== steamData.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: steamData.name,
          avatar: steamData.avatar || user.avatar,
        },
      });
    }
  }
  
  return user;
}
