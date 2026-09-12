'use client';

import { useEffect, useState } from 'react';
import { Users, Trophy, Crosshair, Activity } from 'lucide-react';

// Mock data for demonstration
const MOCK_STATS = {
  playersOnline: 1247,
  playersInGame: 856,
  matchesToday: 342,
  totalMatches: 15678,
};

export default function Home() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen bg-cs-bg">
      {/* Header Banner */}
      <header className="cs-panel border-b-2 border-cs-accent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="cs-title text-4xl md:text-5xl">
                CS 1.6 MATCHMAKING
              </h1>
              <p className="cs-subtitle mt-2">
                FACEIT-STYLE COMPETITIVE PLATFORM
              </p>
            </div>
            
            <button className="cs-button text-lg px-8 py-4 animate-pulse-slow">
              🎮 ПОИСК ИГРЫ
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Игроков онлайн"
              value={stats.playersOnline}
              color="text-status-green"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="В игре"
              value={stats.playersInGame}
              color="text-status-yellow"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Матчей сегодня"
              value={stats.matchesToday}
              color="text-cs-accent"
            />
            <StatCard
              icon={<Crosshair className="w-6 h-6" />}
              label="Всего матчей"
              value={stats.totalMatches.toLocaleString()}
              color="text-status-blue"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Lobby Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lobby Panel */}
          <div className="lg:col-span-2">
            <LobbyPanel />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FriendsList />
            <RecentMatches />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  color: string;
}) {
  return (
    <div className="cs-panel flex items-center gap-3">
      <div className={`p-2 bg-cs-light rounded-none ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 uppercase">{label}</p>
      </div>
    </div>
  );
}

function LobbyPanel() {
  return (
    <div className="cs-panel">
      <div className="cs-panel-header flex items-center justify-between">
        <span>🎯 Ваше Лобби</span>
        <span className="text-sm font-normal text-gray-400">5v5 Captain</span>
      </div>
      
      <div className="p-6">
        {/* Lobby Slots Grid */}
        <div className="lobby-grid mb-6">
          {[1, 2, 3, 4, 5].map((slot) => (
            <LobbySlot key={slot} index={slot} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="cs-button flex-1">
            + Пригласить друга
          </button>
          <button className="cs-button-secondary flex-1">
            Настройки
          </button>
        </div>

        {/* Region & Mode Selector */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="cs-subtitle block mb-2">Регион</label>
            <select className="w-full bg-cs-light border border-cs-border p-2 text-white">
              <option>🇪🇺 Europe West</option>
              <option>🇪🇺 Europe East</option>
              <option>🇺🇸 NA East</option>
              <option>🇺🇸 NA West</option>
            </select>
          </div>
          <div>
            <label className="cs-subtitle block mb-2">Режим</label>
            <select className="w-full bg-cs-light border border-cs-border p-2 text-white">
              <option>5v5 Captain</option>
              <option>5v5 Auto</option>
              <option>1v1 Aim</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function LobbySlot({ index }: { index: number }) {
  const isFilled = index === 1; // First slot filled for demo
  
  return (
    <div className={`lobby-slot ${isFilled ? 'lobby-slot-filled' : 'lobby-slot-empty'}`}>
      {isFilled ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-none bg-cs-accent mx-auto mb-2 flex items-center justify-center">
            <span className="text-cs-bg font-bold text-xl">P1</span>
          </div>
          <p className="text-sm font-bold text-cs-accent">PlayerOne</p>
          <p className="text-xs text-gray-400">ELO: 1250</p>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-status-green rounded-full animate-pulse"></span>
            <span className="text-xs text-status-green">Ready</span>
          </div>
        </div>
      ) : (
        <div className="text-center opacity-30">
          <div className="w-12 h-12 border-2 border-dashed border-gray-500 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Пустой слот</p>
        </div>
      )}
    </div>
  );
}

function FriendsList() {
  const friends = [
    { name: 'Nagibator2000', status: 'online', game: 'In Game' },
    { name: 'ProGamer', status: 'online', game: 'Online' },
    { name: 'CS_Veteran', status: 'away', game: 'Away' },
    { name: 'NoobSlayer', status: 'offline', game: 'Offline' },
  ];

  return (
    <div className="cs-panel">
      <div className="cs-panel-header">
        👥 Друзья (3/10)
      </div>
      <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
        {friends.map((friend, i) => (
          <div key={i} className="flex items-center gap-2 p-2 hover:bg-cs-hover cursor-pointer">
            <div className={`w-2 h-2 rounded-full ${
              friend.status === 'online' ? 'bg-status-green' :
              friend.status === 'away' ? 'bg-status-yellow' :
              'bg-status-red'
            }`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{friend.name}</p>
              <p className="text-xs text-gray-400 truncate">{friend.game}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentMatches() {
  const matches = [
    { map: 'de_dust2', result: 'W', score: '16-12', elo: '+18' },
    { map: 'de_inferno', result: 'L', score: '14-16', elo: '-15' },
    { map: 'de_mirage', result: 'W', score: '16-8', elo: '+22' },
  ];

  return (
    <div className="cs-panel">
      <div className="cs-panel-header">
        📊 Последние матчи
      </div>
      <div className="p-2 space-y-2">
        {matches.map((match, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-cs-light">
            <div className={`w-8 h-8 flex items-center justify-center font-bold ${
              match.result === 'W' ? 'bg-status-green text-cs-bg' : 'bg-status-red text-white'
            }`}>
              {match.result}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{match.map}</p>
              <p className="text-xs text-gray-400">{match.score}</p>
            </div>
            <div className={`text-sm font-bold ${
              match.elo.startsWith('+') ? 'text-status-green' : 'text-status-red'
            }`}>
              {match.elo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
