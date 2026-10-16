import { Crown } from 'lucide-react';
import { SeatRow } from '../../components/ui/Theater';
import { Skeleton } from '../../components/ui/Primitives';

// People in the room: a seat map, then the guest list
export default function PeoplePanel({ seats, isHost, onMakeHost }) {
  return (
    <div className="box-scroll">
      <div className="seat-map">
        <div className="seat-screen" aria-hidden="true"><span>Screen</span></div>
        <SeatRow seats={seats} label="Seats in this room" />
      </div>

      <div className="guest-list">
        <span className="caption">Guest list · {seats.length}</span>
        {seats.length === 0 ? (
          [0, 1].map((i) => (
            <div key={i} className="guest" aria-hidden="true">
              <Skeleton width={36} height={36} radius="50%" />
              <div style={{ flex: 1, display: 'grid', gap: 6 }}><Skeleton width="55%" height={12} /><Skeleton width="30%" height={10} /></div>
            </div>
          ))
        ) : seats.map((seat) => (
          <div key={seat.id} className="guest">
            <span className={`avatar${seat.isYou ? ' is-you' : ''}`}>{seat.name.slice(5, 7).toUpperCase()}</span>
            <div className="guest-info">
              <span className="guest-name">
                {seat.name}
                {seat.isHost && <span className="host-tag" title="Host"><Crown aria-hidden="true" /> Host</span>}
              </span>
              <span className="guest-sub">{seat.isYou ? 'You' : 'Seated'}</span>
            </div>
            {isHost && !seat.isYou && (
              <button onClick={() => onMakeHost(seat.id)} className="btn btn-secondary btn-sm">Make host</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
