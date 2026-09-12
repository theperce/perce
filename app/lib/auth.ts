import NextAuth, { NextAuthOptions } from 'next-auth';
import SteamProvider from 'next-auth/providers/steam';
import { findOrCreateUser, checkUserPenalty } from './steam';

const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const authOptions: NextAuthOptions = {
  providers: [
    SteamProvider({
      clientId: STEAM_API_KEY,
      clientSecret: STEAM_API_KEY, // Steam uses the same key for both
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider !== 'steam') {
        return false;
      }

      try {
        const steamId64 = profile?.steamid as string;
        
        if (!steamId64) {
          console.error('No Steam ID in profile');
          return false;
        }

        // Find or create user in database
        const dbUser = await findOrCreateUser({
          steamId64,
          name: user.name || `Player_${steamId64.slice(-8)}`,
          avatar: user.image || undefined,
        });

        // Check if user is banned
        const penaltyCheck = await checkUserPenalty(dbUser.id);
        
        if (penaltyCheck.isBanned) {
          // User is banned, prevent sign in
          throw new Error(`Account banned: ${penaltyCheck.reason}`);
        }

        // Attach user ID to session
        user.id = dbUser.id;
        user.steamId = dbUser.steamId;
        user.steamId32 = dbUser.steamId32;
        user.elo = dbUser.elo;
        user.rankLevel = dbUser.rankLevel;

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.steamId = user.steamId;
        token.steamId32 = user.steamId32;
        token.elo = user.elo;
        token.rankLevel = user.rankLevel;
      }
      
      if (profile) {
        token.steamId64 = (profile as any).steamid;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.steamId = token.steamId as string;
        session.user.steamId32 = token.steamId32 as string;
        session.user.elo = token.elo as number;
        session.user.rankLevel = token.rankLevel as number;
      }
      
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};

const handler = (req: Request, res: Response) => {
  // This is a placeholder - actual implementation uses NextAuth with API routes
  return NextAuth(req, res, authOptions);
};

export default handler;

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      steamId: string;
      steamId32: string;
      elo: number;
      rankLevel: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    steamId: string;
    steamId32: string;
    elo: number;
    rankLevel: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    steamId: string;
    steamId32: string;
    steamId64?: string;
    elo: number;
    rankLevel: number;
  }
}
