import { Link2, UserPlus } from 'lucide-react';
import Brand from '../../components/Brand';
import { SyncIndicator } from '../../components/ui/Theater';

export default function RoomHeader({ roomId, onCopyLink, syncState, seats }) {
  const shown = seats.slice(0, 4);
  return (
    <header className="room-top room-chrome">
      <Brand to="/" size="sm" />

      <div className="room-top-center">
        <button className="room-code" onClick={onCopyLink} title="Copy the invite link">
          <span className="caption">Room</span>
          <span className="room-code-value">{roomId}</span>
          <Link2 aria-hidden="true" />
        </button>
        <SyncIndicator state={syncState} />
      </div>

      <div className="room-top-right">
        <div className="room-audience" aria-label={`${seats.length} in the room`}>
          <div className="avatar-stack" aria-hidden="true">
            {shown.map((s) => (
              <span key={s.id} className={`avatar avatar-sm${s.isYou ? ' is-you' : ''}`}>{s.name.slice(5, 7).toUpperCase()}</span>
            ))}
          </div>
          <span className="room-audience-count">{seats.length} <span className="muted">in the room</span></span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onCopyLink}>
          <UserPlus /> <span className="hide-sm">Invite</span>
        </button>
      </div>
    </header>
  );
}
