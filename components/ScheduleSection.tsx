import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { SPORTS_SCROLLER_ITEMS } from '../utils/defaults';
import { Match } from '../types';

interface ScheduleSectionProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  matches,
  onSelectMatch,
  selectedSport,
  onSelectSport,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'live' | 'today' | 'tomorrow' | 'upcoming'>('all');

  const filteredMatches = matches.filter(m => {
    if (selectedSport !== 'All' && (m.sport || '').toLowerCase() !== selectedSport.toLowerCase()) {
      return false;
    }
    if (filterTab === 'live') return m.status === 'LIVE';
    if (filterTab === 'today') return m.day === 'today';
    if (filterTab === 'tomorrow') return m.day === 'tomorrow';
    if (filterTab === 'upcoming') return m.status === 'UPCOMING';
    return true;
  });

  const counts = {
    all: matches.length,
    live: matches.filter(m => m.status === 'LIVE').length,
    today: matches.filter(m => m.day === 'today').length,
    tomorrow: matches.filter(m => m.day === 'tomorrow').length,
  };

  const getSportCount = (sportId: string) => {
    if (sportId === 'All') return matches.length;
    return matches.filter(m => (m.sport || '').toLowerCase() === sportId.toLowerCase()).length;
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Sports Scroller with Dynamic Counts */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {SPORTS_SCROLLER_ITEMS.map(sport => {
          const isActive = selectedSport === sport.id;
          const count = getSportCount(sport.id);

          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className="flex flex-col items-center justify-center flex-shrink-0 w-16 group cursor-pointer"
            >
              <div className="relative mb-1">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
                  isActive
                    ? 'bg-blue-600/30 text-blue-300 border-2 border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-[#121c2d] text-slate-300 border border-slate-700/80 group-hover:border-slate-600'
                }`}>
                  {sport.icon}
                </div>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                    {count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold truncate max-w-[62px] text-center ${
                isActive ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}>
                {sport.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            filterTab === 'all'
              ? 'bg-[#1a2942] text-white border border-blue-500/60 shadow-sm'
              : 'bg-[#121c2d] text-slate-400 border border-slate-800'
          }`}
        >
          <span>✓</span>
          <span>All ({counts.all})</span>
        </button>

        <button
          onClick={() => setFilterTab('live')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            filterTab === 'live'
              ? 'bg-rose-950/40 text-rose-300 border border-rose-500/60 shadow-sm'
              : 'bg-[#121c2d] text-slate-400 border border-slate-800'
          }`}
        >
          <span className="text-rose-500">((•))</span>
          <span>Live ({counts.live})</span>
        </button>

        <button
          onClick={() => setFilterTab('today')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            filterTab === 'today'
              ? 'bg-[#1a2942] text-white border border-blue-500/60 shadow-sm'
              : 'bg-[#121c2d] text-slate-400 border border-slate-800'
          }`}
        >
          <span>🕒</span>
          <span>Today's ({counts.today})</span>
        </button>

        <button
          onClick={() => setFilterTab('tomorrow')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            filterTab === 'tomorrow'
              ? 'bg-[#1a2942] text-white border border-blue-500/60 shadow-sm'
              : 'bg-[#121c2d] text-slate-400 border border-slate-800'
          }`}
        >
          <span>🕒</span>
          <span>Tomorrow</span>
        </button>
      </div>

      {/* Match Cards List or Clean Empty State */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#121c2d]/60 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-3">
            <Radio className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">কোনো ম্যাচ পাওয়া যায়নি</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            লাইভ ম্যাচ ও ইভেন্ট যুক্ত করা হলে এখানে দেখা যাবে। আপনি Settings ➜ Admin Hub থেকে সরাসরি ম্যাচ যোগ করতে পারবেন।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredMatches.map(match => {
            const isLive = match.status === 'LIVE';

            return (
              <div
                key={match.id}
                onClick={() => onSelectMatch(match)}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#131d2e] hover:bg-[#1a263e] border border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                {/* Card Centered Header */}
                <div className="text-center text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1.5 mb-2.5">
                  <span className="text-slate-400">▶</span>
                  <span>{match.sport} || {match.competition}</span>
                </div>

                {/* Match Card Body: Team 1 | Center Info | Team 2 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  {/* Home Team */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-white/10 p-0.5 shadow-sm">
                      {match.homeLogo ? (
                        <img src={match.homeLogo} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">{match.home.slice(0, 2)}</div>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-1.5 line-clamp-1 max-w-[100px]">
                      {match.home}
                    </span>
                  </div>

                  {/* Center Kickoff / Score */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    {isLive ? (
                      <>
                        <div className="text-rose-500 font-black text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                          LIVE
                        </div>
                        <div className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                          {match.score || 'VS'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {match.progress || 'Live Now'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-black text-slate-100">
                          {match.time}
                        </div>
                        <div className="text-[10px] text-sky-400 font-bold mt-0.5">
                          {match.date || 'Today'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {match.progress || 'Upcoming'}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-white/10 p-0.5 shadow-sm">
                      {match.awayLogo ? (
                        <img src={match.awayLogo} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">{match.away.slice(0, 2)}</div>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-1.5 line-clamp-1 max-w-[100px]">
                      {match.away}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
