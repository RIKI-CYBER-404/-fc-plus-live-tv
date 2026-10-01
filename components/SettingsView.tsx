import React, { useState } from 'react';
import { 
  Tv, ListPlus, Radio, CircleDot, Trophy, PictureInPicture2, 
  Send, HelpCircle, Heart, ShieldCheck, Share2, RefreshCw, 
  Trash2, ChevronRight, Download, Star, Search, Check
} from 'lucide-react';
import { AdminSettings, SyncState, Match } from '../types';

interface SettingsViewProps {
  onOpenNetworkStream: () => void;
  onOpenPlaylists: () => void;
  onOpenAdminHub: () => void;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  settings: AdminSettings;
  syncState: SyncState;
  onTriggerSync: () => Promise<void>;
  onShowToast: (msg: string) => void;
  matches: Match[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenNetworkStream,
  onOpenPlaylists,
  onOpenAdminHub,
  onNavigate,
  isAdmin,
  settings,
  syncState,
  onTriggerSync,
  onShowToast,
  matches,
}) => {
  // Toggle states matching the screenshot
  const [lowQuality, setLowQuality] = useState(() => localStorage.getItem('fcplus_low_quality') === 'true');
  const [fullscreenPlayback, setFullscreenPlayback] = useState(() => localStorage.getItem('fcplus_fullscreen') === 'true');
  const [defaultFirstServer, setDefaultFirstServer] = useState(() => localStorage.getItem('fcplus_first_server') !== 'false');

  const toggleLowQuality = () => {
    const val = !lowQuality;
    setLowQuality(val);
    localStorage.setItem('fcplus_low_quality', String(val));
    onShowToast(`Force Low Quality: ${val ? 'Enabled' : 'Disabled'}`);
  };

  const toggleFullscreen = () => {
    const val = !fullscreenPlayback;
    setFullscreenPlayback(val);
    localStorage.setItem('fcplus_fullscreen', String(val));
    onShowToast(`Fullscreen Playback: ${val ? 'Enabled' : 'Disabled'}`);
  };

  const toggleFirstServer = () => {
    const val = !defaultFirstServer;
    setDefaultFirstServer(val);
    localStorage.setItem('fcplus_first_server', String(val));
    onShowToast(`Default to First Server: ${val ? 'Enabled' : 'Disabled'}`);
  };

  const handleDownloadHtml = () => {
    const link = document.createElement('a');
    link.href = '/fcplus-live-tv.html';
    link.download = 'fcplus-live-tv.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Downloading fcplus-live-tv.html');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear saved app data? Favorites will be reset.')) {
      localStorage.removeItem('fcplus_favorites_v1');
      localStorage.removeItem('fcplus_cached_matches');
      localStorage.removeItem('fcplus_cached_channels');
      onShowToast('App data cleared successfully.');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'FC+ LIVE TV',
          text: 'Watch Live Sports & Matches with FC+ LIVE TV',
          url: window.location.origin
        });
      } else {
        navigator.clipboard.writeText(window.location.origin);
        onShowToast('App link copied to clipboard!');
      }
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fade-in text-slate-100">
      {/* Top Header of Settings Screen */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('favorites')}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
            title="Favorites"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={onTriggerSync}
            disabled={syncState.isSyncing}
            className={`w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors ${
              syncState.isSyncing ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SECTION 1: GENERAL */}
      <div>
        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase px-2 mb-2.5">
          GENERAL
        </h3>
        <div className="space-y-2">
          {/* Network Stream */}
          <button
            onClick={onOpenNetworkStream}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
              <Tv className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Network Stream</span>
              <span className="text-xs text-slate-400 block mt-0.5">Add a direct live stream (.m3u8)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
          </button>

          {/* Playlists */}
          <button
            onClick={onOpenPlaylists}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
              <ListPlus className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Playlists</span>
              <span className="text-xs text-slate-400 block mt-0.5">Manage M3U / M3U8 playlists</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
          </button>

          {/* Cricket Score */}
          <button
            onClick={() => onNavigate('home')}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <CircleDot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Cricket Score</span>
              <span className="text-xs text-slate-400 block mt-0.5">Scores and match updates</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </button>

          {/* Football Score */}
          <button
            onClick={() => onNavigate('home')}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Football Score</span>
              <span className="text-xs text-slate-400 block mt-0.5">Scores and match updates</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </button>

          {/* Floating Player */}
          <div className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] border border-slate-800 flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <PictureInPicture2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Floating Player</span>
              <span className="text-xs text-slate-400 block mt-0.5">Keep the player above the app</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </div>

          {/* Toggle: Force Low Quality */}
          <div 
            onClick={toggleLowQuality}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#182337] border border-slate-800 flex items-center gap-3.5 cursor-pointer select-none transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚙</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Force Low Quality</span>
              <span className="text-xs text-slate-400 block mt-0.5">Forces lowest resolution on mobile data</span>
            </div>
            {/* Toggle switch */}
            <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${lowQuality ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${lowQuality ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>

          {/* Toggle: Fullscreen Playback */}
          <div 
            onClick={toggleFullscreen}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#182337] border border-slate-800 flex items-center gap-3.5 cursor-pointer select-none transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">□</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Fullscreen Playback</span>
              <span className="text-xs text-slate-400 block mt-0.5">Open video in fullscreen automatically</span>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${fullscreenPlayback ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${fullscreenPlayback ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>

          {/* Toggle: Default to First Server */}
          <div 
            onClick={toggleFirstServer}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#182337] border border-slate-800 flex items-center gap-3.5 cursor-pointer select-none transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-black">▷</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Default to First Server</span>
              <span className="text-xs text-slate-400 block mt-0.5">Try the first available server</span>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${defaultFirstServer ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${defaultFirstServer ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMMUNITY */}
      <div>
        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase px-2 mb-2.5">
          COMMUNITY
        </h3>
        <div className="space-y-2">
          {/* Join Channel */}
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Join Channel</span>
              <span className="text-xs text-slate-400 block mt-0.5">Follow FC+ LIVE TV updates</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </a>

          {/* Contact Us */}
          <div className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] border border-slate-800 flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Contact Us</span>
              <span className="text-xs text-slate-400 block mt-0.5">Get help and support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </div>

          {/* Donate Us */}
          <div className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] border border-slate-800 flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Donate Us</span>
              <span className="text-xs text-slate-400 block mt-0.5">Support the project</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* SECTION 3: APP & ADMIN */}
      <div>
        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase px-2 mb-2.5">
          APP & ADMIN MANAGEMENT
        </h3>
        <div className="space-y-2">
          {/* Admin Hub */}
          <button
            onClick={onOpenAdminHub}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-900/30 to-[#141d2f] hover:from-blue-900/40 border border-blue-500/40 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Admin Hub & Push Updates</span>
                {isAdmin ? (
                  <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                ) : (
                  <span className="text-[9px] font-black uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">PIN Protected</span>
                )}
              </div>
              <span className="text-xs text-blue-300 block mt-0.5">Only admin pushes match & stream updates to GitHub</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </button>

          {/* Download Standalone File */}
          <button
            onClick={handleDownloadHtml}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Download HTML File (.html)</span>
              <span className="text-xs text-emerald-300 block mt-0.5">সব কোড একটি ফাইলের ভেতর ডাউনলোড করুন</span>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 flex items-center gap-3.5 text-left transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Share With Friends</span>
              <span className="text-xs text-slate-400 block mt-0.5">Share FC+ LIVE TV app</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </button>

          {/* Clear App Data */}
          <button
            onClick={handleClearData}
            className="w-full min-h-[72px] px-4 py-3 rounded-2xl bg-[#141d2f] hover:bg-[#1a253b] border border-slate-800 flex items-center gap-3.5 text-left transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-white block">Clear App Data</span>
              <span className="text-xs text-slate-400 block mt-0.5">Reset saved favorites and cache</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
