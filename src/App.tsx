import React, { useState, useEffect, useCallback } from 'react';
import { Match, Channel, StreamSource, AdminSettings, SyncState } from './types';
import { 
  DEFAULT_GITHUB_REPO, 
  DEFAULT_GITHUB_BRANCH, 
  DEFAULT_URLS, 
  INITIAL_MATCHES, 
  INITIAL_BANGLA_CHANNELS 
} from './utils/defaults';
import { 
  fetchGitHubMatches, 
  fetchRemoteText, 
  parseM3U 
} from './services/githubSync';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { MultiSourceModal } from './components/MultiSourceModal';
import { HeroMatch } from './components/HeroMatch';
import { ScheduleSection } from './components/ScheduleSection';
import { CategoriesView } from './components/CategoriesView';
import { SportsView } from './components/SportsView';
import { FavoritesView } from './components/FavoritesView';
import { AdminModal } from './components/AdminModal';
import { SettingsView } from './components/SettingsView';
import { BanglaView } from './components/BanglaView';
import { HighlightsView } from './components/HighlightsView';
import { BottomNav } from './components/BottomNav';

const STORAGE_KEYS = {
  favorites: 'fcplus_favorites_v1',
  adminAuth: 'fcplus_admin_authenticated',
  adminSettings: 'fcplus_admin_settings_v1',
  theme: 'fcplus_theme',
  cachedMatches: 'fcplus_matches_live',
  cachedChannels: 'fcplus_channels_live',
};

const DEFAULT_SETTINGS: AdminSettings = {
  githubRepo: DEFAULT_GITHUB_REPO,
  githubBranch: DEFAULT_GITHUB_BRANCH,
  matchesUrl: DEFAULT_URLS.matches,
  livePlaylistUrl: DEFAULT_URLS.livePlaylist,
  categoryPlaylistUrl: DEFAULT_URLS.categoryPlaylist,
  sportPlaylistUrl: DEFAULT_URLS.sportPlaylist,
  githubToken: '',
  adminPin: 'admin123',
};

export default function App() {
  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) !== 'light';
  });

  // Admin Auth
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.adminAuth) === 'true';
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.adminSettings);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Data
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.cachedMatches);
      return cached ? JSON.parse(cached) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.cachedChannels);
      return cached ? JSON.parse(cached) : INITIAL_BANGLA_CHANNELS;
    } catch {
      return INITIAL_BANGLA_CHANNELS;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.favorites);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync State
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    matchesCount: matches.length,
    channelsCount: channels.length,
    githubRepo: settings.githubRepo,
  });

  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'categories' | 'bangla' | 'sports' | 'highlights' | 'favorites' | 'admin' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  // Player State
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeSource, setActiveSource] = useState<StreamSource | null>(null);
  const [allSources, setAllSources] = useState<StreamSource[]>([]);
  const [multiSourceModalOpen, setMultiSourceModalOpen] = useState(false);
  const [pendingMatchForModal, setPendingMatchForModal] = useState<Match | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Save favorites & settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.adminSettings, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cachedMatches, JSON.stringify(matches));
    } catch {}
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cachedChannels, JSON.stringify(channels));
    } catch {}
  }, [channels]);

  // Sync from GitHub
  const syncWithGitHub = useCallback(async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    let fetchedMatchesCount = 0;
    let fetchedChannelsCount = 0;

    try {
      // 1. Fetch matches.json
      if (settings.matchesUrl) {
        try {
          const ghMatches = await fetchGitHubMatches(settings.matchesUrl);
          if (ghMatches && ghMatches.length > 0) {
            setMatches(ghMatches);
            fetchedMatchesCount = ghMatches.length;
          }
        } catch (err: any) {
          console.warn('GitHub matches sync error:', err.message);
        }
      }

      // 2. Fetch playlists (live, category, sport)
      const allLoadedChannels: Channel[] = [];

      if (settings.livePlaylistUrl) {
        try {
          const liveText = await fetchRemoteText(settings.livePlaylistUrl);
          const liveChans = parseM3U(liveText, 'live');
          allLoadedChannels.push(...liveChans);
        } catch (err: any) {
          console.warn('Live playlist sync error:', err.message);
        }
      }

      if (settings.categoryPlaylistUrl) {
        try {
          const catText = await fetchRemoteText(settings.categoryPlaylistUrl);
          const catChans = parseM3U(catText, 'category');
          allLoadedChannels.push(...catChans);
        } catch (err: any) {
          console.warn('Category playlist sync error:', err.message);
        }
      }

      if (settings.sportPlaylistUrl) {
        try {
          const sportText = await fetchRemoteText(settings.sportPlaylistUrl);
          const sportChans = parseM3U(sportText, 'sport');
          allLoadedChannels.push(...sportChans);
        } catch (err: any) {
          console.warn('Sport playlist sync error:', err.message);
        }
      }

      if (allLoadedChannels.length > 0) {
        // Deduplicate channels
        const seen = new Set<string>();
        const unique = allLoadedChannels.filter(c => {
          if (seen.has(c.streamUrl)) return false;
          seen.add(c.streamUrl);
          return true;
        });
        setChannels(unique);
        fetchedChannelsCount = unique.length;
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSyncState({
        isSyncing: false,
        lastSyncTime: timeStr,
        error: null,
        matchesCount: fetchedMatchesCount || matches.length,
        channelsCount: fetchedChannelsCount || channels.length,
        githubRepo: settings.githubRepo,
      });

      showToast(`Synced from GitHub (${fetchedMatchesCount} matches, ${fetchedChannelsCount} channels)`);
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Sync failed'
      }));
      showToast('GitHub sync completed with local cached fallback.');
    }
  }, [settings, matches.length, channels.length, showToast]);

  // Initial Sync on Mount
  useEffect(() => {
    syncWithGitHub();
    // Auto sync from GitHub every 5 minutes so users get admin updates automatically
    const interval = setInterval(syncWithGitHub, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Admin login / logout
  const handleAdminLogin = (pin: string) => {
    if (pin.trim() === settings.adminPin.trim()) {
      setIsAdmin(true);
      localStorage.setItem(STORAGE_KEYS.adminAuth, 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEYS.adminAuth);
    showToast('Admin Mode Locked.');
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from favorites.');
        return prev.filter(item => item !== id);
      } else {
        showToast('Added to favorites!');
        return [...prev, id];
      }
    });
  };

  // Play match
  const handleSelectMatch = (match: Match) => {
    const sources = match.sources && match.sources.length > 0
      ? match.sources
      : match.streamUrl
      ? [{ id: 'src-1', name: 'SERVER 1 - AQ', url: match.streamUrl, live: match.status === 'LIVE' }]
      : [];

    if (sources.length > 1) {
      setPendingMatchForModal(match);
      setMultiSourceModalOpen(true);
    } else if (sources.length === 1) {
      setActiveMatch(match);
      setActiveChannel(null);
      setActiveSource(sources[0]);
      setAllSources(sources);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Find matching sports channel as fallback
      const matchingChan = channels.find(c => 
        c.sport.toLowerCase() === match.sport.toLowerCase() || 
        c.name.toLowerCase().includes(match.sport.toLowerCase())
      );
      if (matchingChan) {
        handleSelectChannel(matchingChan);
      } else {
        showToast('No stream URL provided for this event yet. Check back soon!');
      }
    }
  };

  const handleSelectSourceFromModal = (source: StreamSource) => {
    if (pendingMatchForModal) {
      setActiveMatch(pendingMatchForModal);
      setActiveChannel(null);
      setActiveSource(source);
      setAllSources(pendingMatchForModal.sources || [source]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Play channel
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setActiveMatch(null);
    setActiveSource({ id: channel.id, name: channel.name, url: channel.streamUrl, live: channel.live });
    setAllSources([{ id: channel.id, name: channel.name, url: channel.streamUrl, live: channel.live }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Featured live match for Hero
  const featuredMatch = matches.find(m => m.status === 'LIVE') || matches[0] || null;

  // Filtered matches by search
  const filteredMatches = matches.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.home.toLowerCase().includes(q) ||
      m.away.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q) ||
      m.sport.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen bg-[#080b10] text-slate-100 flex flex-col font-sans transition-colors ${
      isDark ? 'dark' : ''
    }`}>
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        syncState={syncState}
        onRefreshSync={syncWithGitHub}
        isDark={isDark}
        onToggleTheme={() => {
          const next = !isDark;
          setIsDark(next);
          localStorage.setItem(STORAGE_KEYS.theme, next ? 'dark' : 'light');
        }}
        isAdmin={isAdmin}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onNavigate={(view) => {
          if (view === 'admin') {
            setAdminModalOpen(true);
          } else {
            setCurrentView(view as any);
          }
        }}
        currentView={currentView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-24 sm:pb-8">
        {/* Live Video Player (Sticky when open) */}
        {(activeMatch || activeChannel) && (
          <VideoPlayer
            match={activeMatch}
            channel={activeChannel}
            activeSource={activeSource}
            allSources={allSources}
            onSelectSource={(source) => setActiveSource(source)}
            onClose={() => {
              setActiveMatch(null);
              setActiveChannel(null);
              setActiveSource(null);
            }}
          />
        )}

        {/* View Switcher */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Schedule Section */}
            <ScheduleSection
              matches={filteredMatches}
              onSelectMatch={handleSelectMatch}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
            />
          </div>
        )}

        {(currentView === 'bangla' || currentView === 'categories') && (
          <CategoriesView
            channels={channels}
            onSelectChannel={handleSelectChannel}
            onRefresh={syncWithGitHub}
          />
        )}

        {currentView === 'sports' && (
          <SportsView
            channels={channels}
            onSelectChannel={handleSelectChannel}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'highlights' && (
          <HighlightsView
            matches={matches}
            onSelectHighlight={handleSelectMatch}
            onRefresh={syncWithGitHub}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            matches={matches}
            channels={channels}
            onSelectMatch={handleSelectMatch}
            onSelectChannel={handleSelectChannel}
            onRemoveFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            onOpenNetworkStream={() => setAdminModalOpen(true)}
            onOpenPlaylists={() => setAdminModalOpen(true)}
            onOpenAdminHub={() => setAdminModalOpen(true)}
            onNavigate={(view) => setCurrentView(view as any)}
            isAdmin={isAdmin}
            settings={settings}
            syncState={syncState}
            onTriggerSync={syncWithGitHub}
            onShowToast={showToast}
            matches={matches}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin') {
            setAdminModalOpen(true);
          } else {
            setCurrentView(view as any);
          }
        }}
        favoritesCount={favorites.length}
        liveCount={matches.filter(m => m.status === 'LIVE').length}
      />

      {/* Multi-Source Link Selection Sheet (PlayZ style) */}
      {multiSourceModalOpen && (
        <MultiSourceModal
          match={pendingMatchForModal}
          sources={pendingMatchForModal?.sources || []}
          onSelect={handleSelectSourceFromModal}
          onClose={() => {
            setMultiSourceModalOpen(false);
            setPendingMatchForModal(null);
          }}
        />
      )}

      {/* Admin Hub Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        settings={settings}
        onUpdateSettings={setSettings}
        matches={matches}
        onUpdateMatches={setMatches}
        channels={channels}
        onUpdateChannels={setChannels}
        syncState={syncState}
        onTriggerSync={syncWithGitHub}
        onShowToast={showToast}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#121c30]/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
