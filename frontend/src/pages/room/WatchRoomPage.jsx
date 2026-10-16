import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../lib/socket';
import RoomGate from './RoomGate';
import RoomHeader from './RoomHeader';
import PlayerBox from './PlayerBox';
import NowPlaying from './NowPlaying';
import ReactionBar from './ReactionBar';
import RoomTabs from './RoomTabs';
import PeoplePanel from './PeoplePanel';
import PollsPanel from './PollsPanel';
import ChatPanel from './ChatPanel';
import { Banner } from '../../components/ui/Primitives';
import { Check } from 'lucide-react';

export default function WatchRoomPage() {
  const { roomId } = useParams();
  const videoRef = useRef(null);
  const isSyncing = useRef(false);
  // What the room should be doing right now: { time, playing, at } (at = when we learned it)
  const roomPlayback = useRef({ time: 0, playing: false, at: 0 });
  const isHostRef = useRef(false);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [volume, setVolume] = useState(1);
  const playerBoxRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  
  const [roomUsers, setRoomUsers] = useState([]);
  const [hostId, setHostId] = useState("");
  const [activeTab, setActiveTab] = useState('Chat');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  // UI-only state (does not affect sync): connection status and a video that failed to load
  const [connection, setConnection] = useState(socket.connected ? 'online' : 'connecting');
  const [videoErrorUrl, setVideoErrorUrl] = useState(null);

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [activePoll, setActivePoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const isHost = socket.id === hostId;
  const myUserId = socket.id ? socket.id.substring(0, 4) : "";

  const setRoomPlayback = (time, playing) => {
    roomPlayback.current = { time, playing, at: Date.now() };
  };

  // Where the room's video should be right now
  const getExpectedTime = () => {
    const { time, playing, at } = roomPlayback.current;
    return playing ? time + (Date.now() - at) / 1000 : time;
  };

  // Move our player to match the room. Only jumps if we are more than maxDrift seconds off.
  // force = true when the host just pressed play/pause: always send the command,
  // because YouTube's "paused" value can lag behind for a moment
  const applyRoomPlayback = (maxDrift, force = false) => {
    const player = videoRef.current;
    if (!player) return;
    isSyncing.current = true;
    const { playing } = roomPlayback.current;
    const expectedTime = getExpectedTime();
    // Pause before jumping: YouTube keeps playing if you jump while it is still playing
    if (!playing && (force || !player.paused)) player.pause();
    if (Math.abs(player.currentTime - expectedTime) > maxDrift) player.currentTime = expectedTime;
    if (playing && (force || player.paused)) player.play().catch(e => console.log('Autoplay blocked:', e));
    // YouTube reports events a moment later, so wait before trusting events again
    setTimeout(() => { isSyncing.current = false; }, 1000);
  };

  // Keep the full screen icon right, even when someone leaves full screen with the Esc key
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerBoxRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Connection status for the banner and sync indicator. Uses its own named handlers,
  // so removing them never touches the sync listeners below.
  useEffect(() => {
    let everConnected = socket.connected;
    let dropped = false;
    const onConnect = () => { setConnection(dropped ? 'reconnected' : 'online'); everConnected = true; };
    const onDisconnect = () => { if (everConnected) dropped = true; setConnection('offline'); };
    const onConnectError = () => setConnection('offline');
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    // The socket may have connected before this listener was attached
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  // House lights: the whole page dims while the film plays and rises when it pauses
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.houseLights = hasInteracted && isPlaying ? 'dim' : 'up';
    return () => { delete root.dataset.houseLights; };
  }, [hasInteracted, isPlaying]);

  // Socket listeners are set up once, so they read "am I host?" from this ref
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Host: every 2 seconds, tell the room where the video is and whether it is playing
  useEffect(() => {
    if (!isHost || !hasInteracted) return;
    const interval = setInterval(() => {
      const player = videoRef.current;
      if (!player || isSyncing.current) return;
      setRoomPlayback(player.currentTime, !player.paused);
      socket.emit('video-sync-heartbeat', { roomId, time: player.currentTime, playing: !player.paused });
    }, 2000);
    return () => clearInterval(interval);
  }, [isHost, hasInteracted, roomId]);

  useEffect(() => {
    if (!hasInteracted) return;
    socket.emit('join-room', roomId);

    // Sent only to us when we join: what the room is watching and where it is up to
    socket.on('room-state', ({ videoUrl: url, playing, time }) => {
      setRoomPlayback(time, playing);
      setVideoUrl(url);
      applyRoomPlayback(0.5);
    });

    socket.on('sync-play', (time) => {
      setRoomPlayback(time, true);
      applyRoomPlayback(0.5, true);
    });

    socket.on('sync-pause', (time) => {
      setRoomPlayback(time, false);
      applyRoomPlayback(0.5, true);
    });

    socket.on('sync-seek', (time) => {
      setRoomPlayback(time, roomPlayback.current.playing);
      applyRoomPlayback(0.5);
    });

    // Drift correction: only jump if we are more than 2 seconds away from the host
    socket.on('sync-heartbeat', (data) => {
      // Ignore anything not in the { time, playing } format (e.g. from an old server that wasn't restarted)
      if (isHostRef.current || typeof data?.time !== 'number' || typeof data?.playing !== 'boolean') return;
      const { time, playing } = data;
      setRoomPlayback(time, playing);
      applyRoomPlayback(2);
    });

    socket.on('sync-url', (newUrl) => {
      setRoomPlayback(0, false);
      setVideoUrl(newUrl);
    });
    socket.on('receive-chat', (msg) => setChatMessages((prev) => [...prev, msg]));
    socket.on('room-users-update', (data) => {
      setRoomUsers(data.users || []);
      setHostId(data.hostId || '');
    });

    socket.on('receive-emoji', (emojiStr) => {
      const iconMap = { heart: '❤️', flame: '🔥', smile: '😂', shocked: '😮' };
      const newEmoji = { id: Date.now(), el: iconMap[emojiStr] || '✨', name: emojiStr, pos: Math.random() * 20 + 75 };
      setFloatingEmojis((prev) => [...prev, newEmoji]);
      setTimeout(() => setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id)), 2800);
    });

    socket.on('receive-poll', (pollData) => {
      setActivePoll(pollData);
      setHasVoted(false);
    });

    socket.on('sync-poll-state', (pollData) => {
      setActivePoll(pollData);
    });

    return () => {
      socket.off('room-state'); socket.off('sync-play'); socket.off('sync-pause'); socket.off('sync-seek'); socket.off('sync-heartbeat');
      socket.off('sync-url'); socket.off('receive-chat'); socket.off('receive-emoji'); socket.off('room-users-update'); socket.off('receive-poll'); socket.off('sync-poll-state');
    };
  }, [roomId, hasInteracted]);

  // The host's play/pause/seek is sent to the room.
  // If a viewer presses play/pause themselves, we undo it so they stay with the host.
  const handlePlay = () => {
    setIsPlaying(true);
    const player = videoRef.current;
    if (!player || isSyncing.current) return;
    if (isHost) {
      setRoomPlayback(player.currentTime, true);
      socket.emit('video-play', { roomId, time: player.currentTime });
    } else if (!roomPlayback.current.playing) {
      player.pause();
    }
  };
  const handlePause = () => {
    setIsPlaying(false);
    const player = videoRef.current;
    if (!player || isSyncing.current) return;
    if (isHost) {
      setRoomPlayback(player.currentTime, false);
      socket.emit('video-pause', { roomId, time: player.currentTime });
    } else if (roomPlayback.current.playing && !player.ended) {
      player.play().catch(e => console.log('Autoplay blocked:', e));
    }
  };
  const handleSeek = () => {
    const player = videoRef.current;
    if (!isHost || !player || isSyncing.current) return;
    // YouTube sometimes reports a "seek" during normal playback, so only send real jumps
    if (Math.abs(player.currentTime - getExpectedTime()) < 1) return;
    setRoomPlayback(player.currentTime, !player.paused);
    socket.emit('video-seek', { roomId, time: player.currentTime });
  };
  const togglePlay = () => {
    const player = videoRef.current;
    if (!isHost || !player) return;
    if (player.paused) player.play();
    else player.pause();
  };
  // Full screen the whole player box, so badges, reactions and controls stay visible
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (playerBoxRef.current) {
      playerBoxRef.current.requestFullscreen().catch(e => console.log('Full screen blocked:', e));
    }
  };
  const changeVideo = () => {
    const newUrl = inputUrl.trim();
    if (!/^https?:\/\/\S+$/i.test(newUrl)) return;
    setVideoUrl(newUrl);
    socket.emit('change-url', { roomId, newUrl });
    setInputUrl("");
  };
  const sendChat = (e) => {
    e.preventDefault();
    if (chatInput.trim() !== "") {
      socket.emit('send-chat', { roomId, text: chatInput });
      setChatInput("");
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const addOptionField = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, ""]);
  };

  const removeOptionField = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const startPoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (pollQuestion.trim() !== "" && validOptions.length >= 2) {
      const newPoll = { 
        id: Date.now(),
        question: pollQuestion, 
        options: validOptions.map(opt => ({ text: opt, votes: 0 })),
        totalVotes: 0
      };
      setActivePoll(newPoll);
      setHasVoted(false);
      socket.emit('start-poll', { roomId, pollData: newPoll });
      
      setPollQuestion("");
      setPollOptions(["", ""]);
    }
  };

  const handleVote = (optIndex) => {
    if (hasVoted || !activePoll) return;
    const updatedPoll = { ...activePoll };
    updatedPoll.options[optIndex].votes += 1;
    updatedPoll.totalVotes += 1;
    
    setActivePoll(updatedPoll);
    setHasVoted(true);
    socket.emit('update-poll-state', { roomId, pollData: updatedPoll });
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const sendEmoji = (emoji) => socket.emit('send-emoji', { roomId, emoji });
  const makeHost = (userId) => socket.emit('transfer-host', { roomId, newHostId: userId });

  if (!hasInteracted) {
    return <RoomGate roomId={roomId} onEnter={() => setHasInteracted(true)} />;
  }

  const seats = roomUsers.map((id) => ({ id, name: `User ${id.substring(0, 4)}`, isYou: id === socket.id, isHost: id === hostId }));
  const syncState = connection === 'online' ? 'synced' : connection === 'connecting' ? 'syncing' : 'offline';
  const videoError = videoErrorUrl !== null && videoErrorUrl === videoUrl;

  return (
    <div className="room" data-lights={isPlaying ? 'dim' : 'up'}>
      <RoomHeader roomId={roomId} onCopyLink={copyRoomLink} syncState={syncState} seats={seats} />

      {connection === 'offline' && (
        <div className="room-banner">
          <Banner title="The projector lost its connection">Reconnecting to the server. The film keeps playing on your screen.</Banner>
        </div>
      )}
      {connection === 'reconnected' && (
        <div className="room-banner">
          <Banner
            tone="info"
            title="You're back online"
            action={<button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Rejoin the room</button>}
          >
            Rejoin to sync up with everyone again.
          </Banner>
        </div>
      )}

      <div className="room-grid">
        <main className="room-stage">
          <PlayerBox
            playerBoxRef={playerBoxRef}
            videoRef={videoRef}
            videoUrl={videoUrl}
            volume={volume}
            onVolumeChange={setVolume}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeek}
            onLoadedMetadata={() => applyRoomPlayback(0.5)}
            onError={() => setVideoErrorUrl(videoUrl)}
            videoError={videoError}
            floatingEmojis={floatingEmojis}
            isPlaying={isPlaying}
            isHost={isHost}
            hostId={hostId}
            onTogglePlay={togglePlay}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <div className="room-below room-chrome">
            <NowPlaying
              isHost={isHost}
              hostId={hostId}
              seatsTaken={roomUsers.length}
              inputUrl={inputUrl}
              onInputUrlChange={setInputUrl}
              onChangeVideo={changeVideo}
            />
            <ReactionBar onReact={sendEmoji} />
          </div>
        </main>

        <aside className="room-box room-chrome velvet" aria-label="Your private box">
          <RoomTabs activeTab={activeTab} onTabChange={setActiveTab} peopleCount={roomUsers.length} />

          <div className="room-box-panel" role="tabpanel" id={`room-panel-${activeTab}`} aria-labelledby={`room-tab-${activeTab}`}>
            {activeTab === 'People' ? (
              <PeoplePanel seats={seats} isHost={isHost} onMakeHost={makeHost} />
            ) : activeTab === 'Polls' ? (
              <PollsPanel
                activePoll={activePoll}
                hasVoted={hasVoted}
                onVote={handleVote}
                isHost={isHost}
                pollQuestion={pollQuestion}
                onPollQuestionChange={setPollQuestion}
                pollOptions={pollOptions}
                onOptionChange={handleOptionChange}
                onAddOption={addOptionField}
                onRemoveOption={removeOptionField}
                onStartPoll={startPoll}
              />
            ) : (
              <ChatPanel chatMessages={chatMessages} myUserId={myUserId} chatInput={chatInput} onChatInputChange={setChatInput} onSend={sendChat} />
            )}
          </div>
        </aside>
      </div>

      {copied && (
        <div className="toast-region">
          <div className="toast" role="status"><Check aria-hidden="true" /> Invite link copied. Send it to your guests.</div>
        </div>
      )}
    </div>
  );
}
