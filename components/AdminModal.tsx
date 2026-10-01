import React, { useState } from 'react';
import { 
  X, Lock, ShieldCheck, Github, RefreshCw, Upload, Download, Copy, Check, 
  Plus, Trash2, Edit3, Radio, AlertCircle, Save, KeyRound 
} from 'lucide-react';
import { Match, Channel, AdminSettings, SyncState, StreamSource } from '../types';
import { pushFileToGitHub } from '../services/githubSync';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  matches: Match[];
  onUpdateMatches: (matches: Match[]) => void;
  channels: Channel[];
  onUpdateChannels: (channels: Channel[]) => void;
  syncState: SyncState;
  onTriggerSync: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  settings,
  onUpdateSettings,
  matches,
  onUpdateMatches,
  channels,
  onUpdateChannels,
  syncState,
  onTriggerSync,
  onShowToast
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'github' | 'matches' | 'streams' | 'security'>('github');

  // New Match State
  const [newMatchHome, setNewMatchHome] = useState('');
  const [newMatchAway, setNewMatchAway] = useState('');
  const [newMatchComp, setNewMatchComp] = useState('Premier League');
  const [newMatchSport, setNewMatchSport] = useState('Football');
  const [newMatchStatus, setNewMatchStatus] = useState<'LIVE' | 'UPCOMING' | 'ENDED'>('LIVE');
  const [newMatchScore, setNewMatchScore] = useState('');
  const [newMatchTime, setNewMatchTime] = useState('08:00 PM');
  const [newMatchHomeLogo, setNewMatchHomeLogo] = useState('');
  const [newMatchAwayLogo, setNewMatchAwayLogo] = useState('');
  const [newMatchStreamUrl, setNewMatchStreamUrl] = useState('');

  // New Channel State
  const [newChanName, setNewChanName] = useState('');
  const [newChanUrl, setNewChanUrl] = useState('');
  const [newChanSport, setNewChanSport] = useState('Sports');

  // Push state
  const [isPushing, setIsPushing] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Security pin state
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(pinInput);
    if (!ok) {
      setLoginError(true);
    } else {
      setLoginError(false);
      setPinInput('');
      onShowToast('Admin Mode Unlocked.');
    }
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchHome || !newMatchAway) {
      alert('Please specify both Home and Away team names.');
      return;
    }

    const sources: StreamSource[] = [];
    if (newMatchStreamUrl) {
      sources.push({
        id: `src-${Date.now()}-1`,
        name: 'SERVER 1 - AQ',
        url: newMatchStreamUrl,
        live: newMatchStatus === 'LIVE'
      });
    }

    const newMatch: Match = {
      id: `admin-match-${Date.now()}`,
      home: newMatchHome,
      away: newMatchAway,
      competition: newMatchComp,
      sport: newMatchSport,
      status: newMatchStatus,
      score: newMatchScore || undefined,
      time: newMatchTime,
      day: newMatchStatus === 'LIVE' ? 'today' : 'upcoming',
      homeLogo: newMatchHomeLogo || undefined,
      awayLogo: newMatchAwayLogo || undefined,
      streamUrl: newMatchStreamUrl || undefined,
      sources: sources.length > 0 ? sources : undefined,
      isHot: newMatchStatus === 'LIVE',
      adminCreated: true
    };

    onUpdateMatches([newMatch, ...matches]);
    onShowToast(`Added match: ${newMatchHome} vs ${newMatchAway}`);

    // Reset form
    setNewMatchHome('');
    setNewMatchAway('');
    setNewMatchScore('');
    setNewMatchStreamUrl('');
  };

  const handleDeleteMatch = (id: string) => {
    if (!confirm('Are you sure you want to remove this match?')) return;
    onUpdateMatches(matches.filter(m => m.id !== id));
    onShowToast('Match deleted.');
  };

  const handleToggleMatchStatus = (id: string) => {
    const updated = matches.map(m => {
      if (m.id !== id) return m;
      const nextStatus: Match['status'] = m.status === 'LIVE' ? 'ENDED' : m.status === 'ENDED' ? 'UPCOMING' : 'LIVE';
      return {
        ...m,
        status: nextStatus,
        day: nextStatus === 'LIVE' ? 'today' : m.day,
        isHot: nextStatus === 'LIVE'
      };
    });
    onUpdateMatches(updated);
    onShowToast('Match status updated.');
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName || !newChanUrl) {
      alert('Channel name and stream URL are required.');
      return;
    }

    const newCh: Channel = {
      id: `custom-${Date.now()}`,
      name: newChanName,
      sport: newChanSport,
      live: true,
      logo: '',
      streamUrl: newChanUrl,
      channelKind: 'sport'
    };

    onUpdateChannels([newCh, ...channels]);
    onShowToast(`Channel "${newChanName}" added.`);
    setNewChanName('');
    setNewChanUrl('');
  };

  // Push matches to GitHub
  const handlePushToGitHub = async () => {
    if (!settings.githubToken) {
      alert('To push directly to GitHub, please enter your GitHub Personal Access Token in the settings below.');
      return;
    }

    setIsPushing(true);
    const content = JSON.stringify(matches, null, 2);

    const res = await pushFileToGitHub({
      repo: settings.githubRepo,
      branch: settings.githubBranch,
      filePath: 'matches.json',
      content,
      commitMessage: `Update live matches via FC+ Admin Portal (${new Date().toLocaleTimeString()})`,
      token: settings.githubToken
    });

    setIsPushing(false);
    if (res.success) {
      onShowToast('Pushed updates to GitHub successfully!');
    } else {
      alert(res.message);
    }
  };

  // Copy JSON
  const handleCopyMatchesJson = () => {
    const jsonStr = JSON.stringify(matches, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
      onShowToast('Copied matches.json to clipboard!');
    });
  };

  // Download JSON
  const handleDownloadMatchesJson = () => {
    const jsonStr = JSON.stringify(matches, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matches.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded matches.json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-base tracking-tight">Admin Hub</h3>
                <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Verified Owner
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Only the administrator pushes updates to GitHub & clients.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isAdmin ? (
          /* Admin Login Gate */
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/5">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-white font-black text-lg mb-1">Admin Authentication Required</h4>
            <p className="text-slate-400 text-xs max-w-sm mb-6">
              To ensure updates are only pushed by the admin, please enter your Admin Passcode. Default is <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">admin123</code>.
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="Enter Admin PIN / Password"
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-700 focus:border-blue-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              {loginError && (
                <div className="text-rose-400 text-xs font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incorrect Passcode. Try again.
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all"
              >
                Unlock Admin Mode
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard (Authenticated) */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('github')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'github'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                GitHub Push & Sync
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'matches'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Matches Manager ({matches.length})
              </button>

              <button
                onClick={() => setActiveTab('streams')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'streams'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Channels & Playlists
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Security
              </button>

              <button
                onClick={onLogout}
                className="ml-auto text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 flex-shrink-0"
              >
                Lock
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Tab 1: GitHub Push & Sync */}
              {activeTab === 'github' && (
                <div className="space-y-4 text-xs">
                  {/* Repo Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="w-5 h-5 text-slate-300" />
                        <div>
                          <span className="font-bold text-white text-sm block">Repository: {settings.githubRepo}</span>
                          <span className="text-[11px] text-slate-400">Branch: {settings.githubBranch}</span>
                        </div>
                      </div>
                      <button
                        onClick={onTriggerSync}
                        disabled={syncState.isSyncing}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                        Sync from GitHub
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-slate-400 block">Matches</span>
                        <span className="font-black text-white text-sm">{matches.length}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-slate-400 block">Channels</span>
                        <span className="font-black text-white text-sm">{channels.length}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 col-span-2">
                        <span className="text-slate-400 block">Last Synced</span>
                        <span className="font-semibold text-emerald-400 truncate block">
                          {syncState.lastSyncTime || 'Ready'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Push to GitHub Section */}
                  <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Upload className="w-4 h-4" />
                      <h4 className="font-black text-sm text-white">Push Updates to GitHub (RIKI-CYBER-404/REDBOX)</h4>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Push your current live matches, scores, and streams directly to <code className="text-blue-300 font-mono">matches.json</code> in your GitHub repository.
                    </p>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        GitHub Personal Access Token (PAT)
                      </label>
                      <input
                        type="password"
                        value={settings.githubToken}
                        onChange={(e) => onUpdateSettings({ ...settings, githubToken: e.target.value })}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for direct API push)"
                        className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Saved locally in your browser. Needs 'contents: write' permission for your repository.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={handlePushToGitHub}
                        disabled={isPushing}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isPushing ? 'Pushing to GitHub...' : 'Push to GitHub (matches.json)'}
                      </button>

                      <button
                        onClick={handleCopyMatchesJson}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedJson ? 'Copied!' : 'Copy matches.json'}
                      </button>

                      <button
                        onClick={handleDownloadMatchesJson}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download JSON
                      </button>

                      <a
                        href="/fcplus-live-tv.html"
                        download="fcplus-live-tv.html"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        ডাউনলোড HTML ফাইল (.html)
                      </a>
                    </div>
                  </div>

                  {/* Remote File URLs */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs">Configured GitHub Data Endpoints</h4>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Live Events M3U (Multi-links)</span>
                        <input
                          type="text"
                          value={settings.livePlaylistUrl}
                          onChange={(e) => onUpdateSettings({ ...settings, livePlaylistUrl: e.target.value })}
                          className="w-full h-8 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Category Channels M3U</span>
                        <input
                          type="text"
                          value={settings.categoryPlaylistUrl}
                          onChange={(e) => onUpdateSettings({ ...settings, categoryPlaylistUrl: e.target.value })}
                          className="w-full h-8 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Sport Channels M3U</span>
                        <input
                          type="text"
                          value={settings.sportPlaylistUrl}
                          onChange={(e) => onUpdateSettings({ ...settings, sportPlaylistUrl: e.target.value })}
                          className="w-full h-8 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Match Manager */}
              {activeTab === 'matches' && (
                <div className="space-y-5">
                  {/* Add New Match Form */}
                  <form onSubmit={handleAddMatch} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Add New Live Event / Match
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Home Team *</label>
                        <input
                          type="text"
                          value={newMatchHome}
                          onChange={(e) => setNewMatchHome(e.target.value)}
                          placeholder="e.g. Real Madrid / India"
                          required
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Away Team *</label>
                        <input
                          type="text"
                          value={newMatchAway}
                          onChange={(e) => setNewMatchAway(e.target.value)}
                          placeholder="e.g. Barcelona / England"
                          required
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Competition</label>
                        <input
                          type="text"
                          value={newMatchComp}
                          onChange={(e) => setNewMatchComp(e.target.value)}
                          placeholder="La Liga / ODI"
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Sport</label>
                        <select
                          value={newMatchSport}
                          onChange={(e) => setNewMatchSport(e.target.value)}
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        >
                          <option value="Football">Football</option>
                          <option value="Cricket">Cricket</option>
                          <option value="Basketball">Basketball</option>
                          <option value="Tennis">Tennis</option>
                          <option value="Motorsport">Motorsport</option>
                          <option value="WWE">WWE</option>
                          <option value="Boxing">Boxing</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Status</label>
                        <select
                          value={newMatchStatus}
                          onChange={(e) => setNewMatchStatus(e.target.value as any)}
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        >
                          <option value="LIVE">LIVE</option>
                          <option value="UPCOMING">Upcoming</option>
                          <option value="ENDED">Ended</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Score (optional)</label>
                        <input
                          type="text"
                          value={newMatchScore}
                          onChange={(e) => setNewMatchScore(e.target.value)}
                          placeholder="e.g. 2 — 1"
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Home Logo URL (optional)</label>
                        <input
                          type="url"
                          value={newMatchHomeLogo}
                          onChange={(e) => setNewMatchHomeLogo(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Away Logo URL (optional)</label>
                        <input
                          type="url"
                          value={newMatchAwayLogo}
                          onChange={(e) => setNewMatchAwayLogo(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">HLS Stream URL (.m3u8)</label>
                      <input
                        type="url"
                        value={newMatchStreamUrl}
                        onChange={(e) => setNewMatchStreamUrl(e.target.value)}
                        placeholder="https://.../index.m3u8"
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Match to List
                    </button>
                  </form>

                  {/* Existing Matches List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                      <span>Existing Matches ({matches.length})</span>
                      <span>Click status to toggle LIVE</span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {matches.map(m => (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate">
                                {m.home} vs {m.away}
                              </span>
                              {m.score && (
                                <span className="font-mono text-emerald-400 font-bold">
                                  [{m.score}]
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {m.competition} • {m.sport} • {m.time}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleMatchStatus(m.id)}
                              className={`px-2 py-0.5 rounded-full font-black text-[10px] transition-colors ${
                                m.status === 'LIVE'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : m.status === 'ENDED'
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {m.status}
                            </button>

                            <button
                              onClick={() => handleDeleteMatch(m.id)}
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors"
                              title="Delete match"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Streams & Playlists */}
              {activeTab === 'streams' && (
                <div className="space-y-4 text-xs">
                  {/* Add single stream */}
                  <form onSubmit={handleAddChannel} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Add Single Channel / Stream
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Channel Name *</label>
                        <input
                          type="text"
                          value={newChanName}
                          onChange={(e) => setNewChanName(e.target.value)}
                          placeholder="e.g. WILLOW SPORTS HD"
                          required
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Sport / Group</label>
                        <input
                          type="text"
                          value={newChanSport}
                          onChange={(e) => setNewChanSport(e.target.value)}
                          placeholder="Cricket / Sports / Bangladesh"
                          className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Stream URL (.m3u8) *</label>
                      <input
                        type="url"
                        value={newChanUrl}
                        onChange={(e) => setNewChanUrl(e.target.value)}
                        placeholder="https://.../index.m3u8"
                        required
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stream
                    </button>
                  </form>

                  {/* Channel Summary */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">Active Channels ({channels.length})</span>
                      <span className="text-[10px] text-slate-400">Parsed from GitHub M3Us + Custom</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {channels.slice(0, 50).map(c => (
                        <div key={c.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200 truncate max-w-[240px]">{c.name}</span>
                          <span className="text-slate-400 text-[10px]">{c.sport || c.groupTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Security */}
              {activeTab === 'security' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-400" />
                      Change Admin Passcode
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Change the passcode used to unlock the Admin Hub and push updates.
                    </p>
                  </div>

                  <div className="max-w-xs space-y-2">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new admin passcode"
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        if (!newPin.trim()) return;
                        onUpdateSettings({ ...settings, adminPin: newPin.trim() });
                        onShowToast('Admin PIN updated successfully.');
                        setNewPin('');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Update Passcode
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
