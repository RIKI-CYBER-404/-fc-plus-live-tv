export interface StreamSource {
  id: string;
  name: string;
  url: string;
  live?: boolean;
}

export interface Match {
  id: string;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  score?: string;
  status: 'LIVE' | 'UPCOMING' | 'ENDED' | 'DELAYED';
  time: string;
  date?: string;
  day: 'today' | 'tomorrow' | 'yesterday' | 'upcoming';
  competition: string;
  sport: string;
  streamUrl?: string;
  sources?: StreamSource[];
  progress?: string;
  isHot?: boolean;
  adminCreated?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  sport: string;
  live: boolean;
  logo: string;
  streamUrl: string;
  groupTitle?: string;
  tvgName?: string;
  source?: string;
  channelKind?: 'live' | 'sport' | 'category';
}

export interface AdminSettings {
  githubRepo: string;
  githubBranch: string;
  matchesUrl: string;
  livePlaylistUrl: string;
  categoryPlaylistUrl: string;
  sportPlaylistUrl: string;
  githubToken: string;
  adminPin: string;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;
  matchesCount: number;
  channelsCount: number;
  githubRepo: string;
}
