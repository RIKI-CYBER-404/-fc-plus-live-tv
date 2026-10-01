import React from 'react';
import { X, Play, Signal, ShieldCheck } from 'lucide-react';
import { Match, StreamSource } from '../types';

interface MultiSourceModalProps {
  match: Match | null;
  sources: StreamSource[];
  onSelect: (source: StreamSource) => void;
  onClose: () => void;
}

export const MultiSourceModal: React.FC<MultiSourceModalProps> = ({
  match,
  sources,
  onSelect,
  onClose
}) => {
  if (!match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-md bg-[#121b2d] border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-white font-extrabold text-base tracking-tight">Multiple Links Available</h3>
            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[280px]">
              {match.home} vs {match.away}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source List */}
        <div className="p-3 max-h-72 overflow-y-auto space-y-2">
          {sources.map((source, index) => (
            <button
              key={source.id || index}
              onClick={() => {
                onSelect(source);
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700/60 hover:border-blue-500/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 group-hover:bg-blue-500 text-blue-400 group-hover:text-white flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-blue-300 block">
                    {source.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Signal className="w-3 h-3 text-emerald-400" />
                    Ultra Low Latency
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live HD
              </span>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Curated and verified stream links
          </p>
        </div>
      </div>
    </div>
  );
};
