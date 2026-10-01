import React, { useState } from 'react';
import { Star, RefreshCw, Search, Trophy } from 'lucide-react';
import { Channel } from '../types';

interface SportsViewProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const SportsView: React.FC<SportsViewProps> = ({
  channels,
  onSelectChannel
}) => {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Strictly filter: ONLY genuine sports channels (exclude any general, news, or entertainment channels)
  const isRealSportsChannel = (c: Channel): boolean => {
    const name = (c.name || '').toLowerCase();
    const grp = (c.groupTitle || c.sport || '').toLowerCase();
    const combined = `${name} ${grp}`;

    // Non-sports keywords to immediately exclude
    const nonSportsKeywords = [
      'somoy', 'jamuna', 'ekattor', 'independent tv', 'channel 24', 'atn news', 'dbc news',
      'news24', 'bangla tv', 'boishakhi', 'deepto', 'maasranga', 'bijoy', 'deshi tv', 'asian tv',
      'ananda tv', 'zeebangla', 'star jalsha', 'jalsha movies', 'colors bangla', 'sony sab',
      'sony pal', 'zee tv', 'star plus', 'colors tv', 'cartoon', 'pogo', 'disney', 'hungama',
      'nickelodeon', 'islam', 'quran', 'peace tv', 'radio', 'music', 'sangeet', 'natok',
      'drama', 'cinema', 'movies', 'nagorik', 'btv'
    ];

    const hasBlacklist = nonSportsKeywords.some(kw => name.includes(kw));
    const hasExplicitSportWord = ['sport', 'sports', 'cricket', 'football', 'soccer'].some(kw => name.includes(kw));
    if (hasBlacklist && !hasExplicitSportWord) {
      return false;
    }

    // Must match real sports terms or networks
    const sportsKeywords = [
      'sport', 'sports', 'cricket', 'football', 'soccer', 'tennis', 'wwe', 'wrestling',
      'racing', 'f1', 'motogp', 'nba', 'ufc', 'boxing', 'golf', 'athletics', 'badminton',
      'sky sports', 'star sports', 'sony ten', 'sony six', 'sony sports', 't sports',
      'willow', 'bein', 'eurosport', 'supersport', 'arena sport', 'espn', 'fox sports',
      'dazn', 'astro super', 'ten sports', 'ptv sports', 'geo super', 'dd sports',
      'bt sport', 'tnt sports', 'fight network', 'laliga', 'premier league', 'bundesliga',
      'mutv', 'real madrid', 'barca tv', 'match tv'
    ];

    return sportsKeywords.some(kw => combined.includes(kw));
  };

  const sportsList = channels
    .filter(isRealSportsChannel)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3.5 animate-fade-in pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>⚽</span>
            <span>Sports TV</span>
          </h1>
          <span className="text-[11px] text-slate-400 font-medium">
            শুধুমাত্র লাইভ স্পোর্টস ও ক্রিকেট/ফুটবল চ্যানেল ({sportsList.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => alert('Favorites')}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
            title="Favorites"
          >
            <Star className="w-4 h-4" />
          </button>
          <button 
            onClick={() => alert('Refreshed')}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sports channels..."
            autoFocus
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-900 text-slate-100 placeholder:text-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* 4-column Channel Cards Grid or Clean Empty State */}
      {sportsList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#121c2d]/60 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">কোনো স্পোর্টস চ্যানেল পাওয়া যায়নি</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            গিটহাবে sportchannel.m3u প্লেলিস্ট যুক্ত বা আপডেট করা হলে এখানে চ্যানেল প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {sportsList.map(channel => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#131d2e] hover:bg-[#1a273e] border border-slate-800/80 hover:border-blue-500/60 flex flex-col items-center justify-between text-center transition-all group aspect-[1/1.25] cursor-pointer"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              
              <span className="text-[11px] sm:text-xs font-bold text-slate-100 group-hover:text-blue-300 w-full truncate leading-tight mt-1.5">
                {channel.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
