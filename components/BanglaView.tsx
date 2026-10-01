import React, { useState } from 'react';
import { ArrowLeft, Star, RefreshCw, Search, Tv } from 'lucide-react';
import { Channel } from '../types';

interface BanglaViewProps {
  channels?: Channel[];
  onBack: () => void;
  onSelectChannel: (channel: Channel) => void;
  onRefresh: () => void;
}

export const BanglaView: React.FC<BanglaViewProps> = ({
  channels = [],
  onBack,
  onSelectChannel,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Strictly filter only Bangladeshi TV channels (Sports channels are strictly excluded to Sports tab)
  const isSports = (c: Channel) => {
    const isKind = c.channelKind === 'sport';
    const grp = (c.groupTitle || c.sport || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    return isKind || grp.includes('sport') || ['sky sport', 'star sport', 'willow', 'sony ten', 'bein sport'].some(s => name.includes(s));
  };

  const banglaList = channels.filter(c => !isSports(c)).filter(c => {
    if (!search) return true;
    return (c.name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-3.5 animate-fade-in pb-16">
      {/* Top bar matching Screenshot 1 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🇧🇩</span>
              <span>Bangladesh</span>
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              সব বাংলাদেশী টিভি চ্যানেল
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => alert('Favorites')}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
          <button 
            onClick={onRefresh}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
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
            placeholder="Search Bangladesh channels..."
            autoFocus
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-900 text-slate-100 placeholder:text-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Channel Cards Grid or Clean Empty State */}
      {banglaList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#121c2d]/60 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-3">
            <Tv className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">কোনো বাংলাদেশী চ্যানেল পাওয়া যায়নি</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            গিটহাবে Categorychannel.m3u প্লেলিস্ট যুক্ত বা আপডেট করা হলে এখানে চ্যানেল প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {banglaList.map(channel => (
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
