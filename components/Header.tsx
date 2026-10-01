import React from 'react';
import { Search, RefreshCw, Sun, Moon, Star, Settings, Play, Download } from 'lucide-react';
import { SyncState } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  syncState: SyncState;
  onRefreshSync: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  syncState,
  onRefreshSync,
  isDark,
  onToggleTheme,
  isAdmin,
  onOpenAdmin,
  onNavigate,
  currentView,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const handleDownloadHtml = async () => {
    try {
      const resp = await fetch('/fcplus-live-tv.html');
      const text = await resp.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fcplus-live-tv.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open('/fcplus-live-tv.html', '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1423]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">FC+ LIVE TV</span>
            </div>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search matches, teams, channels..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-900/90 text-slate-100 placeholder:text-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Download File Button */}
          <button
            onClick={handleDownloadHtml}
            className="px-3 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            title="Download Standalone HTML File"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ডাউনলোড ফাইল</span>
          </button>

          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Favorites shortcut */}
          <button
            onClick={() => onNavigate('favorites')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
            title="Favorites"
          >
            <Star className="w-4 h-4" />
          </button>

          {/* GitHub Sync Button */}
          <button
            onClick={onRefreshSync}
            disabled={syncState.isSyncing}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors ${
              syncState.isSyncing ? 'animate-spin text-emerald-400' : ''
            }`}
            title={syncState.lastSyncTime ? `Last synced: ${syncState.lastSyncTime}` : 'Sync from GitHub'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
              currentView === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden pt-2.5 pb-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search matches, channels..."
              autoFocus
              className="w-full h-10 pl-9 pr-3 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};
