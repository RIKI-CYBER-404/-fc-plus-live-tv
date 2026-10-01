import React from 'react';
import { Play, Star } from 'lucide-react';
import { Match } from '../types';

interface HeroMatchProps {
  match: Match | null;
  onWatch: (match: Match) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const HeroMatch: React.FC<HeroMatchProps> = ({
  match,
  onWatch,
  isFavorite,
  onToggleFavorite
}) => {
  if (!match) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-[#10192a] to-[#0c1424] shadow-xl p-5 sm:p-7 mb-6">
      {/* Decorative sports glow & ball pattern */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/5 pointer-events-none hidden md:block">
        <div className="w-full h-full rounded-full border border-white/5 scale-75"></div>
      </div>

      <div className="relative z-10 max-w-xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
            {match.status === 'LIVE' ? 'LIVE NOW' : 'FEATURED EVENT'}
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs font-bold text-emerald-400 tracking-wide">
            {match.competition}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-4">
          {match.home} vs {match.away}
        </h2>

        {/* Teams & Score */}
        <div className="flex items-center gap-4 sm:gap-6 mb-5 bg-slate-950/40 border border-white/5 rounded-2xl p-3 sm:p-4 backdrop-blur-sm max-w-md">
          {/* Home */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {match.homeLogo && (
              <img
                src={match.homeLogo}
                alt=""
                className="w-10 h-10 rounded-xl object-contain bg-slate-800 p-1 flex-shrink-0 border border-slate-700/60"
              />
            )}
            <span className="text-sm font-bold text-white truncate">{match.home}</span>
          </div>

          {/* Score or Time */}
          <div className="text-center px-2 flex-shrink-0">
            {match.score ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {match.score}
                </span>
                {match.progress && (
                  <span className="block text-[10px] font-bold text-rose-400 mt-0.5">
                    {match.progress}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-sm sm:text-base font-black text-white">VS</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{match.time}</span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <span className="text-sm font-bold text-white truncate text-right">{match.away}</span>
            {match.awayLogo && (
              <img
                src={match.awayLogo}
                alt=""
                className="w-10 h-10 rounded-xl object-contain bg-slate-800 p-1 flex-shrink-0 border border-slate-700/60"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onWatch(match)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            Watch Live
          </button>

          <button
            onClick={() => onToggleFavorite(match.id)}
            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              isFavorite
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Saved' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
};
