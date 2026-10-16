import { useNavigate, useOutletContext } from 'react-router-dom';
import { Play, Plus, Ticket } from 'lucide-react';
import { Stagger, Reveal } from '../components/motion/Motion';
import { Marquee, TicketStub } from '../components/ui/Theater';
import { SectionHead, EmptyState } from '../components/ui/Primitives';

// Same rooms as before: clicking one goes to /room/DEMO0…DEMO3
const LIVE_ROOMS = [
  { title: 'Hostel B-block horror night', host: 'Sana', film: 'Get Out' },
  { title: 'Anime binge', host: 'Ishaan', film: 'Your Name' },
  { title: 'Sunday classics', host: 'Meera', film: '3 Idiots' },
  { title: 'Docs & chill', host: 'Kabir', film: 'Chasing Coral' },
];

const newRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function HomePage() {
  const navigate = useNavigate();
  const { openCreateRoom, openJoinRoom } = useOutletContext();

  return (
    <div className="home">
      {/* Now showing: the featured room as a billboard */}
      <section className="billboard curtain" aria-labelledby="featured-title">
        <div className="billboard-light spotlight-cone" aria-hidden="true" />
        <Stagger className="billboard-copy" gap={0.1} delay={0.15}>
          <Reveal><Marquee>Now showing</Marquee></Reveal>
          <Reveal><span className="caption">Featured · from your friends</span></Reveal>
          <Reveal><h1 id="featured-title" className="display-1">Friday movie <span className="serif">night</span></h1></Reveal>
          <Reveal><p className="lede">Interstellar · 42:13 of 2:49:00 · Arrival is up next in the queue.</p></Reveal>
          <Reveal className="billboard-actions">
            <button onClick={() => navigate(`/room/${newRoomCode()}`)} className="btn btn-primary btn-lg" data-magnetic>
              <Play fill="currentColor" /> Join room
            </button>
            <span className="billboard-audience">
              <span className="avatar-stack" aria-hidden="true">
                <span className="avatar avatar-sm tone-copper">AR</span>
                <span className="avatar avatar-sm tone-mist">ME</span>
                <span className="avatar avatar-sm tone-slate">SA</span>
              </span>
              <span className="muted">4 watching</span>
            </span>
          </Reveal>
        </Stagger>

        <div className="billboard-screen-wrap" aria-hidden="true">
          <div className="billboard-screen">
            <span className="art art-1" />
            <span className="badge badge-live">Live</span>
            <span className="billboard-progress"><span /></span>
          </div>
          <div className="billboard-note paper">
            <span className="caption">Up next</span>
            <span className="billboard-note-title serif">Arrival</span>
          </div>
        </div>
      </section>

      {/* Live now: ticket stubs */}
      <section className="lobby-section" aria-labelledby="live-title">
        <div className="lobby-section-head">
          <SectionHead number="01" caption="Live now" title={<span id="live-title">Tonight's <span className="serif">screenings</span></span>} />
          <button className="link-arrow" onClick={openJoinRoom}><Ticket /> Have a code?</button>
        </div>
        {LIVE_ROOMS.length === 0 ? (
          <EmptyState title="The marquee is dark tonight">Nobody's screening right now. Start a room and it will appear here.</EmptyState>
        ) : (
          <div className="ticket-grid">
            {LIVE_ROOMS.map((room, i) => (
              <TicketStub
                key={room.title}
                code={`DEMO${i}`}
                title={room.title}
                meta={<><span className="serif ticket-film">{room.film}</span> · hosted by {room.host}</>}
                caption={<span className="ticket-live"><span className="dot dot-pulse" /> Live · now playing</span>}
                onClick={() => navigate(`/room/DEMO${i}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Your rooms */}
      <section className="lobby-section" aria-labelledby="yours-title">
        <SectionHead number="02" caption="Your rooms" title={<span id="yours-title">Your <span className="serif">tickets</span></span>} />
        <EmptyState
          title="No tickets in your pocket yet"
          action={<button className="btn btn-primary" onClick={openCreateRoom}><Plus /> Create a room</button>}
        >
          Rooms you host or join will be kept here, stub and all.
        </EmptyState>
      </section>
    </div>
  );
}
