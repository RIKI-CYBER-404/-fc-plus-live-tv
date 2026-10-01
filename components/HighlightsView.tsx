import React, { useState } from 'react';
import { Star, RefreshCw, Search, Film } from 'lucide-react';
import { Match } from '../types';

interface HighlightsViewProps {
  matches?: Match[];
  onSelectHighlight: (match: Match) => void;
  onRefresh: () => void;
}

export const HighlightsView: React.FC<HighlightsViewProps> = ({
  matches = [],
  onSelectHighlight,
  onRefresh
}) => {
  const [selectedSport, setSelectedSport] = useState('All');

  // Filter ended matches or matches with highlights
  const highlightsList = matches.filter(m => {
    const isEnded = m.status === 'ENDED' || m.day === 'yesterday';
    if (!isEnded) return false;
    if (selectedSport !== 'All' && (m.sport || '').toLowerCase() !== selectedSport.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Top Bar matching Screenshot 4 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Highlights</h1>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => alert('Favorites')}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
          >
            <Star className="w-5 h-5" />
          </button>
          <button 
            onClick={onRefresh}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => alert('Search')}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sports Scroller */}
      <div className="flex items-center gap-3 pb-1">
        <button
          onClick={() => setSelectedSport('All')}
          className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all cursor-pointer ${
            selectedSport === 'All'
              ? 'bg-blue-600/20 border-2 border-blue-500 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-black text-[11px] border border-white/10">
              ALL
            </div>
            {highlightsList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                {highlightsList.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1">All</span>
        </button>

        <button
          onClick={() => setSelectedSport('Football')}
          className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all cursor-pointer ${
            selectedSport === 'Football'
              ? 'bg-blue-600/20 border-2 border-blue-500 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-white/10">
              ⚽
            </div>
          </div>
          <span className="text-[10px] font-bold mt-1">Football</span>
        </button>
      </div>

      {/* Highlights List or Clean Empty State */}
      {highlightsList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#121c2d]/60 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-3">
            <Film className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">কোনো হাইলাইটস পাওয়া যায়নি</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            ম্যাচ সম্পন্ন হলে অথবা হাইলাইটস স্ট্রিম যুক্ত করা হলে এখানে প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {highlightsList.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectHighlight(item)}
              className="p-3.5 rounded-2xl bg-[#131d2e] hover:bg-[#1a263d] border border-slate-800/90 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-300 font-bold truncate max-w-[65%]">
                  {item.sport} | {item.competition}
                </span>
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                  <span>{item.time}</span>
                  <span className="text-slate-400 font-medium">{item.date || ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 sm:px-6">
                <div className="flex items-center gap-3">
                  {item.homeLogo && (
                    <img src={item.homeLogo} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  )}
                  <span className="text-sm font-bold text-white group-hover:text-blue-300">
                    {item.home}
                  </span>
                </div>

                <span className="text-base font-black text-slate-200 tracking-wider">
                  VS
                </span>

                <div className="flex items-center gap-3 justify-end">
                  <span className="text-sm font-bold text-white group-hover:text-blue-300">
                    {item.away}
                  </span>
                  {item.awayLogo && (
                    <img src={item.awayLogo} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
