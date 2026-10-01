import React from 'react';
import { Star, Play, Trophy } from 'lucide-react';
import { Match, Channel } from '../types';

interface FavoritesViewProps {
  favorites: string[];
  matches: Match[];
  channels: Channel[];
  onSelectMatch: (match: Match) => void;
  onSelectChannel: (channel: Channel) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  matches,
  channels,
  onSelectMatch,
  onSelectChannel,
  onRemoveFavorite
}) => {
  const favoriteMatches = matches.filter(m => favorites.includes(m.id));
  const favoriteChannels = channels.filter(c => favorites.includes(c.id));
  const totalCount = favoriteMatches.length + favoriteChannels.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            Favorites
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Your bookmarked live events and channels</p>
        </div>
        <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
          {totalCount} Items
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-white font-bold text-base mb-1">No Favorites Yet</h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Tap the star icon on any match or sports channel to save it for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favorite Matches */}
          {favoriteMatches.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Favorite Matches ({favoriteMatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {favoriteMatches.map(match => (
                  <div
                    key={match.id}
                    className="p-3.5 rounded-2xl bg-[#151f32] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm truncate">
                        {match.home} vs {match.away}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {match.competition} • {match.status} {match.score && `• ${match.score}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectMatch(match)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                        Watch
                      </button>
                      <button
                        onClick={() => onRemoveFavorite(match.id)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-slate-400"
                        title="Remove"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Channels */}
          {favoriteChannels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Favorite Channels ({favoriteChannels.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {favoriteChannels.map(channel => (
                  <div
                    key={channel.id}
                    className="p-3 rounded-2xl bg-[#141d2f] border border-slate-800 flex flex-col items-center text-center relative"
                  >
                    <button
                      onClick={() => onRemoveFavorite(channel.id)}
                      className="absolute top-2 right-2 text-amber-400"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-slate-800 p-1.5 mb-2 mt-1">
                      <img src={channel.logo} alt="" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-white truncate w-full mb-2">
                      {channel.name}
                    </span>
                    <button
                      onClick={() => onSelectChannel(channel)}
                      className="w-full py-1 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-lg text-[11px] font-bold"
                    >
                      Watch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
