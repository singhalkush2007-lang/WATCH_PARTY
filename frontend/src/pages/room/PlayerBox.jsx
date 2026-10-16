import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Crown, Play, Pause, Maximize, Minimize, Heart, Flame, Laugh, Zap, Sparkles, AlertTriangle } from 'lucide-react';

const REACTION_ICONS = { heart: Heart, flame: Flame, smile: Laugh, shocked: Zap };

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
};

// The screen. The progress line and clock are updated straight on the DOM
// (no React state), so the room doesn't re-render several times a second.
export default function PlayerBox({
  playerBoxRef, videoRef, videoUrl, volume, onVolumeChange,
  onPlay, onPause, onSeeked, onLoadedMetadata, onError, videoError,
  floatingEmojis, isPlaying, isHost, hostId, onTogglePlay,
  isFullscreen, onToggleFullscreen,
}) {
  const progressRef = useRef(null);
  const timeRef = useRef(null);
  const durationRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleTimeUpdate = (e) => {
    const { currentTime, duration } = e.currentTarget;
    // a late joiner may arrive mid-film: past the opening it's an intermission, not a beginning
    if (!hasStarted && currentTime > 0.5) setHasStarted(true);
    if (timeRef.current) timeRef.current.textContent = formatTime(currentTime);
    if (progressRef.current && duration > 0) progressRef.current.style.transform = `scaleX(${Math.min(1, currentTime / duration)})`;
  };
  const handleDuration = (e) => {
    if (durationRef.current) durationRef.current.textContent = formatTime(e.currentTarget.duration);
  };
  const handlePlay = (e) => {
    if (!hasStarted) setHasStarted(true);
    onPlay(e);
  };

  const hostName = hostId ? `User ${hostId.substring(0, 4)}` : 'the host';
  const showCurtainCard = videoUrl && !videoError && !isPlaying;

  return (
    <div className="player" ref={playerBoxRef} data-playing={isPlaying}>
      <div className="player-frame">
        <ReactPlayer
          ref={videoRef}
          src={videoUrl || undefined}
          controls
          width="100%"
          height="100%"
          volume={volume}
          onPlay={handlePlay}
          onPause={onPause}
          onSeeked={onSeeked}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDuration}
          onError={onError}
          onVolumeChange={(e) => onVolumeChange(e.currentTarget.volume)}
          style={{ background: 'var(--navy-1000)', objectFit: 'contain' }}
        />

        {!videoUrl && (
          <div className="screen-state" role="status">
            <span className="screen-state-shimmer" aria-hidden="true" />
            <span className="caption">Setting up the projector</span>
          </div>
        )}

        {videoError && (
          <div className="screen-state is-error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <p className="screen-state-title">This film won't play here</p>
            <p className="muted">The video may block embedding or the link may be wrong. {isHost ? 'Try another link in the projection booth below.' : 'The host can load another one.'}</p>
          </div>
        )}

        {showCurtainCard && (
          <div className="intermission" aria-hidden="true">
            <span className="caption">{hasStarted ? 'Paused for everyone' : 'Tonight’s screening'}</span>
            <span className="intermission-title serif">{hasStarted ? 'Intermission' : 'About to begin'}</span>
            <span className="intermission-note">{isHost ? 'Press play when everyone is seated' : `The film resumes when ${hostName} presses play`}</span>
          </div>
        )}
      </div>

      <div className="reaction-layer" aria-hidden="true">
        {floatingEmojis.map((e) => {
          const Icon = REACTION_ICONS[e.name] || Sparkles;
          return (
            <span key={e.id} className="reaction-float" data-reaction-float style={{ left: `${e.pos}%` }}>
              <Icon />
            </span>
          );
        })}
      </div>

      <div className="controls">
        <div className="progress" aria-hidden="true"><span ref={progressRef} className="progress-fill" /></div>
        <div className="control-row">
          <div className="control-group">
            <button
              className="play-btn"
              onClick={onTogglePlay}
              disabled={!isHost}
              aria-label={isPlaying ? 'Pause for everyone' : 'Play for everyone'}
              title={isHost ? undefined : 'Only the host controls playback'}
            >
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
            <span className="time"><span ref={timeRef}>0:00</span> <span className="time-sep">/</span> <span ref={durationRef}>0:00</span></span>
          </div>
          <div className="control-group">
            <span className="host-tag"><Crown aria-hidden="true" /> {isHost ? 'You hold the remote' : `${hostName} holds the remote`}</span>
            <button className="icon-btn" onClick={onToggleFullscreen} title={isFullscreen ? 'Exit full screen' : 'Full screen'} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <Minimize /> : <Maximize />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
