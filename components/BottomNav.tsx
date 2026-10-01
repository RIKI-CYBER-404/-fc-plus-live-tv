import React from 'react';
import { Radio, Tv, Trophy, Film, Settings } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  favoritesCount: number;
  liveCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  liveCount
}) => {
  return (
    <nav className="fixed bottom-2 inset-x-3 sm:hidden z-40 bg-[#162134]/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl py-2 px-2 flex items-center justify-between">
      {/* 1. Live Events */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'home'
            ? 'text-blue-400 font-extrabold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <Radio className="w-5 h-5" />
          {liveCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Live Events</span>
      </button>

      {/* 2. Categories (Contains Bangladesh tab) */}
      <button
        onClick={() => onNavigate('categories')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'categories' || currentView === 'bangla'
            ? 'text-blue-400 font-extrabold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Tv className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-tight">Categories</span>
      </button>

      {/* 3. Sports */}
      <button
        onClick={() => onNavigate('sports')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'sports'
            ? 'text-blue-400 font-extrabold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-tight">Sports</span>
      </button>

      {/* 4. Highlights */}
      <button
        onClick={() => onNavigate('highlights')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'highlights'
            ? 'text-blue-400 font-extrabold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-tight">Highlights</span>
      </button>

      {/* 5. Settings (Highlighted blue pill button matching screenshot) */}
      <button
        onClick={() => onNavigate('settings')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'settings'
            ? 'text-blue-400 font-extrabold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          currentView === 'settings' ? 'bg-blue-600/30 text-blue-400 shadow-md shadow-blue-500/20' : ''
        }`}>
          <Settings className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
