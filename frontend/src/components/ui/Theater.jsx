import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

// "NOW SHOWING" sign with bulbs that light up in sequence
export function Marquee({ children = 'Now showing', bulbs = 12 }) {
  const row = (reverse) => Array.from({ length: bulbs }, (_, i) => (
    <span key={i} className="bulb" style={{ '--i': reverse ? bulbs - i : i }} />
  ));
  return (
    <div className="marquee">
      <span className="marquee-bulbs top" aria-hidden="true">{row(false)}</span>
      <span className="marquee-text">{children}</span>
      <span className="marquee-bulbs bottom" aria-hidden="true">{row(true)}</span>
    </div>
  );
}

// A cinema ticket: perforated edge, room code on the stub.
// Renders as a link (to), a button (onClick) or plain content.
export function TicketStub({ code, title, meta, caption = 'Room', admit = 'Admit one', to, onClick, children }) {
  const ticket = (
    <span className="ticket">
      <span className="ticket-main">
        <span className="caption">{caption}</span>
        <span>
          <span className="ticket-title" style={{ display: 'block' }}>{title}</span>
          {meta && <span className="ticket-meta" style={{ display: 'block' }}>{meta}</span>}
        </span>
        {children}
      </span>
      <span className="ticket-stub">
        <span className="ticket-admit">{admit}</span>
        <span className="ticket-code">{code}</span>
      </span>
    </span>
  );
  if (to) return <Link to={to} className="ticket-wrap">{ticket}</Link>;
  if (onClick) return <button type="button" className="ticket-wrap" onClick={onClick}>{ticket}</button>;
  return <div className="ticket-wrap">{ticket}</div>;
}

// People in the room as seats in a gently curved cinema row.
// seats: [{ id, name, isYou, isHost }]
export function SeatRow({ seats, perRow = 8, minSeats = 16, label = 'Seats in this room', legend = true }) {
  const total = Math.max(minSeats, Math.ceil(seats.length / perRow) * perRow);
  const all = Array.from({ length: total }, (_, i) => seats[i] || null);
  const rows = [];
  for (let i = 0; i < all.length; i += perRow) rows.push(all.slice(i, i + perRow));
  const arc = (i) => {
    const d = i - (perRow - 1) / 2;
    return `${(d * d * 0.5).toFixed(1)}px`;
  };
  return (
    <div>
      <div className="seats" role="list" aria-label={label}>
        {rows.map((row, r) => (
          <div className="seat-row" key={r}>
            {row.map((seat, i) => seat ? (
              <span
                key={seat.id}
                role="listitem"
                className={`seat ${seat.isYou ? 'is-you' : 'is-taken'}`}
                style={{ '--arc': arc(i) }}
                title={seat.name}
                aria-label={`${seat.name}${seat.isHost ? ', host' : ''}${seat.isYou ? ', you' : ''}`}
              >
                {seat.isHost && <span className="seat-crown" aria-hidden="true"><Crown /></span>}
              </span>
            ) : (
              <span key={`free-${r}-${i}`} className="seat" style={{ '--arc': arc(i) }} aria-hidden="true" />
            ))}
          </div>
        ))}
      </div>
      {legend && (
        <div className="seats-legend" aria-hidden="true">
          <span><i className="lg-you" />You</span>
          <span><i className="lg-taken" />Watching</span>
          <span><i className="lg-free" />Empty seat</span>
        </div>
      )}
    </div>
  );
}

const SYNC_LABELS = { synced: 'In sync', syncing: 'Syncing', offline: 'Offline' };

// Live sync status with expanding copper rings
export function SyncIndicator({ state = 'synced', label }) {
  return (
    <span className="sync" data-state={state} role="status">
      <span className="sync-dot" aria-hidden="true" />
      {label ?? SYNC_LABELS[state]}
    </span>
  );
}
