import { Match, Channel, StreamSource } from '../types';
import { createSvgLogo, getChannelFallbackLogo } from '../utils/defaults';

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function parseExtInf(line: string) {
  const result = { name: '', logo: '', groupTitle: '' };
  const attrRegex = /([\w-]+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(line))) {
    const key = match[1].toLowerCase();
    const val = match[2];
    if (key === 'tvg-logo') result.logo = val;
    if (key === 'tvg-name') result.name = val;
    if (key === 'group-title') result.groupTitle = val;
  }
  const commaIdx = line.indexOf(',');
  if (commaIdx >= 0) {
    const displayName = line.slice(commaIdx + 1).trim();
    if (!result.name) result.name = displayName;
  }
  return result;
}

export function parseM3U(text: string, kind: 'live' | 'sport' | 'category' = 'live'): Channel[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsed: Channel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('#EXTINF')) continue;

    const info = parseExtInf(line);
    let streamUrl = '';

    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].startsWith('#')) {
        streamUrl = lines[j];
        i = j;
        break;
      }
    }

    if (!streamUrl || !isValidUrl(streamUrl)) continue;

    const channelName = info.name || 'Channel';
    const group = info.groupTitle || (kind === 'sport' ? 'Sports' : 'General');
    const logo = info.logo || getChannelFallbackLogo(channelName);

    parsed.push({
      id: `ch-${hashString(streamUrl + '|' + channelName)}`,
      name: channelName,
      sport: group,
      live: true,
      logo,
      streamUrl,
      groupTitle: group,
      tvgName: info.name,
      channelKind: kind
    });
  }

  return parsed;
}

export async function fetchRemoteText(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchGitHubMatches(matchesUrl: string): Promise<Match[]> {
  const text = await fetchRemoteText(matchesUrl);
  const data = JSON.parse(text);
  const rawList = Array.isArray(data) ? data : (data.matches || data.events || []);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86400000);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  return rawList.map((item: any, idx: number): Match => {
    const home = String(item.home || item.homeTeam || item.home_name || 'Home').trim();
    const away = String(item.away || item.awayTeam || item.away_name || 'Away').trim();
    const id = String(item.id || `gh-match-${hashString(home + away + (item.time || idx))}`);
    
    let rawStatus = String(item.status || 'UPCOMING').toUpperCase();
    let status: Match['status'] = 'UPCOMING';
    if (['LIVE', 'INPLAY', '1H', '2H', 'HT'].includes(rawStatus)) status = 'LIVE';
    else if (['ENDED', 'FT', 'FINISHED'].includes(rawStatus)) status = 'ENDED';
    else if (['DELAYED', 'POSTPONED'].includes(rawStatus)) status = 'DELAYED';

    let day: Match['day'] = 'upcoming';
    const dateVal = String(item.date || item.time || '');
    if (dateVal.includes(todayStr) || status === 'LIVE') day = 'today';
    else if (dateVal.includes(tomorrowStr)) day = 'tomorrow';

    const sources: StreamSource[] = [];
    if (item.streamUrl && isValidUrl(item.streamUrl)) {
      sources.push({
        id: `src-${id}-main`,
        name: 'SERVER 1 - AQ',
        url: item.streamUrl,
        live: status === 'LIVE'
      });
    }

    if (Array.isArray(item.sources)) {
      item.sources.forEach((s: any, sIdx: number) => {
        const sUrl = typeof s === 'string' ? s : s?.url;
        const sName = typeof s === 'object' && s?.name ? s.name : `SERVER ${sources.length + 1} - AQ`;
        if (isValidUrl(sUrl)) {
          sources.push({
            id: `src-${id}-${sIdx}`,
            name: sName,
            url: sUrl,
            live: status === 'LIVE'
          });
        }
      });
    }

    return {
      id,
      home,
      away,
      homeLogo: item.homeLogo || item.home_logo || createSvgLogo(home.slice(0, 2)),
      awayLogo: item.awayLogo || item.away_logo || createSvgLogo(away.slice(0, 2)),
      score: item.score || (item.homeScore !== undefined && item.awayScore !== undefined ? `${item.homeScore} — ${item.awayScore}` : undefined),
      status,
      time: item.time ? (item.time.includes('T') ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time) : 'TBD',
      date: item.date || item.time,
      day,
      competition: item.competition || item.league || item.tournament || 'Sports Live',
      sport: item.sport || 'Football',
      streamUrl: sources[0]?.url || item.streamUrl || '',
      sources: sources.length > 0 ? sources : undefined,
      progress: item.progress || (status === 'LIVE' ? 'Live' : undefined),
      isHot: item.isHot ?? status === 'LIVE'
    };
  });
}

export async function pushFileToGitHub(options: {
  repo: string;
  branch: string;
  filePath: string;
  content: string;
  commitMessage: string;
  token: string;
}): Promise<{ success: boolean; message: string; sha?: string }> {
  const { repo, branch, filePath, content, commitMessage, token } = options;
  if (!token) {
    return { success: false, message: 'GitHub Personal Access Token is required to commit directly to GitHub.' };
  }

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
    let existingSha: string | undefined;

    // Check if file exists to get current SHA
    const checkResp = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (checkResp.ok) {
      const fileData = await checkResp.json();
      existingSha = fileData.sha;
    }

    // Base64 encode content (handles UTF-8)
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const body: any = {
      message: commitMessage,
      content: base64Content,
      branch
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const putResp = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });

    if (!putResp.ok) {
      const errJson = await putResp.json().catch(() => ({}));
      throw new Error(errJson.message || `GitHub API responded with status ${putResp.status}`);
    }

    const resJson = await putResp.json();
    return {
      success: true,
      message: `Successfully pushed updates to GitHub (${repo}/${filePath})!`,
      sha: resJson.commit?.sha
    };
  } catch (err: any) {
    return {
      success: false,
      message: `GitHub Push failed: ${err.message || String(err)}`
    };
  }
}
