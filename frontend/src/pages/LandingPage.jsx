import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ArrowRight, Play } from 'lucide-react';
import Brand from '../components/Brand';
import { Stagger, Reveal, InView } from '../components/motion/Motion';
import { Marquee, SeatRow, SyncIndicator, TicketStub } from '../components/ui/Theater';

const newRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const DEMO_SEATS = [
  { id: 'a', name: 'Aarav', isHost: true },
  { id: 'b', name: 'You', isYou: true },
  { id: 'c', name: 'Meera' },
  { id: 'd', name: 'Sana' },
];

const ACTS = [
  { act: 'Act one', title: 'Open a room', text: 'One click gives you a private room with its own six-letter code. Paste a YouTube link or any video file.', detail: 'Room · 7KQ2XD' },
  { act: 'Act two', title: 'Send the ticket', text: 'Share the link or the code. Your guests take their seat in a single click, wherever their couch is.', detail: 'Admit one' },
  { act: 'Act three', title: 'Press play together', text: 'Play, pause and seek land for everyone at the same moment. Anyone who drifts more than two seconds is quietly brought back.', detail: 'In sync · ±2s' },
];

const HOUSE = [
  { num: '01', title: 'House lights', text: 'The room dims around the screen while the film plays, and the lights rise for the intermission.' },
  { num: '02', title: 'A private box', text: 'Chat, live polls and your seat map sit beside the screen, never on top of it.' },
  { num: '03', title: 'Applause', text: 'Send a reaction and it rises over the picture for everyone in the room.' },
  { num: '04', title: 'One remote', text: 'The host holds the remote. Hand it over to anyone in the room with one tap.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [code, setCode] = useState('');

  // Smooth scrolling on this page only (off for reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.2 });
    return () => lenis.destroy();
  }, [reduceMotion]);

  // A little parallax on the hero screen
  const { scrollY } = useScroll();
  const screenY = useTransform(scrollY, [0, 700], [0, -70]);
  const curtainY = useTransform(scrollY, [0, 700], [0, 90]);

  const startRoom = () => navigate(`/room/${newRoomCode()}`);
  const joinRoom = (e) => {
    e.preventDefault();
    if (code.trim()) navigate(`/room/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="landing">
      <header className="land-nav">
        <Brand to="/welcome" />
        <nav className="land-links" aria-label="Page">
          <a href="#programme">How it works</a>
          <a href="#house">In the house</a>
          <Link to="/signin">Sign in</Link>
        </nav>
        <Link to="/" className="btn btn-secondary btn-sm">Open the lobby</Link>
      </header>

      {/* Hero: curtain, spotlight, and a screen with the show already running */}
      <section className="land-hero" aria-labelledby="hero-title">
        <m.div className="land-curtain curtain" style={reduceMotion ? undefined : { y: curtainY }} aria-hidden="true" />
        <div className="land-hero-light spotlight-cone" aria-hidden="true" />
        <div className="land-hero-grid">
          <Stagger className="land-hero-copy" gap={0.12} delay={1.0}>
            <Reveal><Marquee bulbs={14}>Now showing · private screenings</Marquee></Reveal>
            <Reveal>
              <h1 id="hero-title" className="display-hero">Same frame. <span className="serif">different couches.</span></h1>
            </Reveal>
            <Reveal>
              <p className="lede">Start a room, send the ticket to your people, and everyone plays, pauses and seeks together, with chat, live polls and applause beside the screen.</p>
            </Reveal>
            <Reveal className="land-cta">
              <button className="btn btn-primary btn-lg" onClick={startRoom} data-magnetic>
                <Play fill="currentColor" /> Start a screening
              </button>
              <form className="land-join" onSubmit={joinRoom}>
                <label htmlFor="land-code" className="sr-only">Room code</label>
                <input id="land-code" className="input code-input" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" spellCheck="false" />
                <button type="submit" className="btn btn-secondary" disabled={!code.trim()}>Join</button>
              </form>
            </Reveal>
          </Stagger>

          <m.div className="land-stage" style={reduceMotion ? undefined : { y: screenY }} aria-hidden="true">
            <div className="land-screen">
              <span className="art art-1" />
              <span className="land-screen-top"><span className="badge badge-live">Live</span><SyncIndicator state="synced" /></span>
              <span className="billboard-progress"><span /></span>
            </div>
            <div className="land-seats">
              <SeatRow seats={DEMO_SEATS} perRow={8} minSeats={8} legend={false} label="Seats" />
            </div>
            <div className="land-ticket">
              <TicketStub code="7KQ2XD" title="Friday movie night" meta="Interstellar · 4 seats taken" caption="Admit one" />
            </div>
          </m.div>
        </div>
      </section>

      {/* How it works: a film programme in three acts */}
      <section id="programme" className="programme" aria-labelledby="programme-title">
        <div className="programme-head">
          <span className="caption">The programme</span>
          <h2 id="programme-title" className="display-1">Three acts, <span className="serif">one evening</span></h2>
          <p className="lede">No downloads, no accounts to juggle. A link, a seat, and the same frame on every screen.</p>
        </div>
        <ol className="programme-list">
          {ACTS.map((a, i) => (
            <InView as="li" key={a.title} className="act" delay={i * 0.08}>
              <span className="act-num" aria-hidden="true">0{i + 1}</span>
              <div className="act-body">
                <span className="caption">{a.act}</span>
                <h3 className="display-2">{a.title}</h3>
                <p className="muted">{a.text}</p>
              </div>
              <span className="act-detail mono" aria-hidden="true">{a.detail}</span>
            </InView>
          ))}
        </ol>
      </section>

      {/* Features as an editorial list, not a grid of icon cards */}
      <section id="house" className="house" aria-labelledby="house-title">
        <InView className="house-head">
          <span className="caption">In the house</span>
          <h2 id="house-title" className="display-1">Everything else <span className="serif">recedes</span></h2>
        </InView>
        <ul className="house-list">
          {HOUSE.map((h, i) => (
            <InView as="li" key={h.title} className="house-item spotlight" delay={i * 0.06}>
              <span className="section-num">{h.num}</span>
              <h3 className="display-3">{h.title}</h3>
              <p className="muted">{h.text}</p>
            </InView>
          ))}
        </ul>
      </section>

      {/* Closing call to action */}
      <section className="land-final curtain" aria-labelledby="final-title">
        <div className="land-final-light spotlight-cone" aria-hidden="true" />
        <InView className="land-final-inner">
          <span className="caption">Your seats are waiting</span>
          <h2 id="final-title" className="display-hero">The lights <span className="serif">are dimming</span></h2>
          <div className="land-final-actions">
            <button className="btn btn-primary btn-lg" onClick={startRoom} data-magnetic><Play fill="currentColor" /> Start a screening</button>
            <Link to="/" className="link-arrow">Browse the lobby <ArrowRight /></Link>
          </div>
        </InView>
      </section>

      <footer className="land-foot">
        <hr className="brass-rule" />
        <div className="land-foot-grid">
          <div className="land-foot-brand">
            <Brand to="/welcome" />
            <p className="muted">A private theater for watching together.</p>
          </div>
          <nav aria-label="Product" className="land-foot-col">
            <span className="caption">Theater</span>
            <Link to="/">The lobby</Link>
            <Link to="/discover">Discover</Link>
            <button className="land-foot-link" onClick={startRoom}>Start a room</button>
          </nav>
          <nav aria-label="Account" className="land-foot-col">
            <span className="caption">Members</span>
            <Link to="/signin">Sign in</Link>
            <Link to="/signup">Create an account</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </div>
        <div className="land-foot-small">
          <span className="mono">© 2026 Couchline</span>
          <span className="muted">Made for movie nights.</span>
        </div>
      </footer>
    </div>
  );
}
