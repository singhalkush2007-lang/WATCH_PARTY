import { Clapperboard } from 'lucide-react';
import { Marquee } from '../../components/ui/Theater';

export default function NowPlaying({ isHost, hostId, seatsTaken, inputUrl, onInputUrlChange, onChangeVideo }) {
  const hostName = hostId ? `User ${hostId.substring(0, 4)}` : 'the host';
  return (
    <div className="now-playing">
      <div className="now-playing-title">
        <Marquee bulbs={9}>Now showing</Marquee>
        <h2 className="display-3">Watch party <span className="serif">session</span></h2>
        <p className="muted">Hosted by {isHost ? 'you' : hostName} · {seatsTaken} {seatsTaken === 1 ? 'seat' : 'seats'} taken</p>
      </div>

      {isHost && (
        <div className="booth">
          <label className="booth-label" htmlFor="booth-url"><Clapperboard aria-hidden="true" /> Projection booth</label>
          <div className="booth-row">
            <input
              id="booth-url"
              type="text"
              className="input"
              placeholder="Paste a YouTube or video link…"
              value={inputUrl}
              onChange={(e) => onInputUrlChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onChangeVideo(); }}
            />
            <button onClick={onChangeVideo} className="btn btn-secondary">Load video</button>
          </div>
        </div>
      )}
    </div>
  );
}
