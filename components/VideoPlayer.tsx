import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Maximize, Minimize, AlertCircle, RefreshCw, Radio, Check } from 'lucide-react';
import { Match, Channel, StreamSource } from '../types';

interface VideoPlayerProps {
  match?: Match | null;
  channel?: Channel | null;
  activeSource?: StreamSource | null;
  allSources?: StreamSource[];
  onSelectSource: (source: StreamSource) => void;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  match,
  channel,
  activeSource,
  allSources = [],
  onSelectSource,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const streamUrl = activeSource?.url || match?.streamUrl || channel?.streamUrl || '';
  const title = match ? `${match.home} vs ${match.away}` : (channel?.name || 'Live Sports Stream');
  const isLive = match?.status === 'LIVE' || channel?.live;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setError(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();

    const isHls = /\.m3u8($|\?)/i.test(streamUrl);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
      });

      hlsRef.current = hls;
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(streamUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {
          // Autoplay blocked: user can click play
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data || !data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try {
            hls.recoverMediaError();
            return;
          } catch {}
        }
        setIsLoading(false);
        setError('This stream source is currently offline or blocked. Try selecting another server link below.');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      // Native Safari iOS / direct mp4 / native HLS
      video.src = streamUrl;
      video.onloadedmetadata = () => {
        setIsLoading(false);
        video.play().catch(() => {});
      };
      video.onerror = () => {
        setIsLoading(false);
        setError('Playback failed on this link. Please try an alternate server.');
      };
    } else {
      setIsLoading(false);
      setError('HLS video playback is not supported on this browser.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  const handleRetry = () => {
    const video = videoRef.current;
    if (video && streamUrl) {
      setIsLoading(true);
      setError(null);
      if (hlsRef.current) {
        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.startLoad();
      } else {
        video.src = streamUrl;
        video.play().catch(() => {});
      }
    }
  };

  const handleToggleFullscreen = () => {
    const container = document.getElementById('player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {
        setIsExpanded(!isExpanded);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      id="player-container"
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-black shadow-2xl transition-all mb-6 ${
        isExpanded ? 'fixed inset-0 z-50 rounded-none h-screen mb-0' : 'aspect-video max-h-[540px]'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        controls
        playsInline
        className="w-full h-full object-contain bg-black"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3"></div>
          <p className="text-white text-xs font-semibold tracking-wide">Connecting to Live Stream...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h4 className="text-white font-bold text-base mb-1">Stream Unavailable</h4>
          <p className="text-slate-300 text-xs max-w-md mb-4">{error}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Stream
            </button>
            {allSources.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = allSources.findIndex(s => s.id === activeSource?.id);
                  const nextSource = allSources[(currentIndex + 1) % allSources.length];
                  if (nextSource) onSelectSource(nextSource);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Switch Server
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Info Overlay */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between pointer-events-auto z-10">
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          {match && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {match.homeLogo && <img src={match.homeLogo} alt="" className="w-6 h-6 rounded-full object-contain bg-slate-800 p-0.5" />}
              <span className="text-white text-xs font-bold">vs</span>
              {match.awayLogo && <img src={match.awayLogo} alt="" className="w-6 h-6 rounded-full object-contain bg-slate-800 p-0.5" />}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-white text-xs sm:text-sm font-bold truncate leading-tight">{title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-300">
              {isLive ? (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  LIVE
                </span>
              ) : (
                <span className="text-slate-400">{match?.status || 'Channel'}</span>
              )}
              {activeSource && (
                <span className="text-emerald-400 font-semibold truncate">
                  • {activeSource.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Toggle fullscreen"
          >
            {isExpanded ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-rose-600/80 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Source Switcher Bar at Bottom */}
      {allSources.length > 1 && (
        <div className="absolute bottom-12 inset-x-0 px-3 py-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
            <Radio className="w-3 h-3 text-emerald-400" />
            Links:
          </span>
          {allSources.map((source, index) => {
            const isActive = activeSource?.id === source.id || (!activeSource && index === 0);
            return (
              <button
                key={source.id}
                onClick={() => onSelectSource(source)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-emerald-300" />}
                {source.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
