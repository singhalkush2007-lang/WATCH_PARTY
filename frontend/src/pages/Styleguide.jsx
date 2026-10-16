import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Play, Plus, Search, Share2, Check } from 'lucide-react';
import Brand from '../components/Brand';
import { Stagger, Reveal } from '../components/motion/Motion';
import { Marquee, TicketStub, SeatRow, SyncIndicator } from '../components/ui/Theater';
import { Toggle, SectionHead, EmptyState, Banner, Skeleton } from '../components/ui/Primitives';
import '../styles/styleguide.css';

// Development-only reference for the Couchline design system (/styleguide).
// Everything here uses the same tokens and components as the real screens.

const PALETTE = [
  { name: 'Midnight Navy', varName: '--navy', hex: '#18202F', role: 'The velvet: every surface' },
  { name: 'Slate Blue', varName: '--slate', hex: '#68748A', role: 'Form edges, quiet details' },
  { name: 'Mist Gray', varName: '--mist', hex: '#DCE1E6', role: 'Secondary text, seats' },
  { name: 'Warm White', varName: '--warm-white', hex: '#FAF7F2', role: 'Text and paper cards' },
  { name: 'Copper', varName: '--copper', hex: '#B8734F', role: 'The light: actions, glow' },
];
const TINTS = ['--navy-1000', '--navy-950', '--navy-900', '--navy-750', '--navy-600', '--slate-700', '--slate-300', '--copper-700', '--copper-300', '--copper-200', '--paper-2'];

const SAMPLE_SEATS = [
  { id: 'a', name: 'Kush', isYou: true },
  { id: 'b', name: 'Aarav', isHost: true },
  { id: 'c', name: 'Meera' },
  { id: 'd', name: 'Sana' },
  { id: 'e', name: 'Ishaan' },
];

export default function Styleguide() {
  const [autoResync, setAutoResync] = useState(true);
  const [notify, setNotify] = useState(false);
  const [genre, setGenre] = useState('Sci-fi');

  return (
    <div className="sg-page">
      <header className="sg-top">
        <Brand to="/" />
        <span className="caption">Design system · development only</span>
        <Link to="/" className="link-arrow">Back to the lobby <ArrowRight /></Link>
      </header>

      {/* Hero: curtain, spotlight, marquee */}
      <section className="sg-hero curtain">
        <div className="sg-hero-light spotlight-cone" aria-hidden="true" />
        <Stagger className="sg-hero-copy" gap={0.12} delay={0.9}>
          <Reveal><Marquee>Now showing</Marquee></Reveal>
          <Reveal><h1 className="display-hero">The house lights <span className="serif">are low</span></h1></Reveal>
          <Reveal><p className="lede">A private theater for watching together. Velvet navy, warm copper light, and a screen that is always the star.</p></Reveal>
        </Stagger>
      </section>

      <main className="sg-main container">
        {/* 01 Palette */}
        <section className="sg-section">
          <SectionHead number="01" caption="Colour" title={<>Five colours, <span className="serif">nothing else</span></>} />
          <div className="sg-swatches">
            {PALETTE.map((c) => (
              <div key={c.name} className="sg-swatch" style={{ '--sw': `var(${c.varName})` }}>
                <span className="sg-swatch-chip" />
                <span className="sg-swatch-name">{c.name}</span>
                <span className="mono sg-swatch-hex">{c.hex}</span>
                <span className="sg-swatch-role">{c.role}</span>
              </div>
            ))}
          </div>
          <div className="sg-tints" aria-label="Tints and shades">
            {TINTS.map((t) => <span key={t} className="sg-tint" style={{ '--sw': `var(${t})` }} title={t} />)}
          </div>
          <p className="muted sg-note">Small text never uses plain Slate or Copper on navy: it uses the lighter tints (6–10:1 contrast). Copper buttons carry deep navy ink, never white.</p>
        </section>

        {/* 02 Type */}
        <section className="sg-section">
          <SectionHead number="02" caption="Typography" title="Four voices" />
          <div className="sg-type">
            <div className="sg-type-row"><span className="caption">Unbounded · display</span><span className="display-1">Same frame</span></div>
            <div className="sg-type-row"><span className="caption">Cormorant Garamond · accent</span><span className="serif sg-serif-big">different couches</span></div>
            <div className="sg-type-row"><span className="caption">DM Sans · interface</span><p className="lede">Start a room, drop the link in your group chat, and everyone plays, pauses and seeks together.</p></div>
            <div className="sg-type-row"><span className="caption">JetBrains Mono · codes & time</span><span className="mono sg-mono-big">ROOM 7KQ2XD · 01:42:13</span></div>
          </div>
        </section>

        {/* 03 Actions */}
        <section className="sg-section">
          <SectionHead number="03" caption="Actions" title={<>Light you can <span className="serif">touch</span></>} />
          <p className="muted sg-note">Move the cursor over the buttons: copper light follows it, and the large primary button is magnetic.</p>
          <div className="sg-row">
            <button className="btn btn-primary btn-lg" data-magnetic><Play fill="currentColor" /> Start a room</button>
            <button className="btn btn-secondary btn-lg"><Share2 /> Invite friends</button>
            <button className="btn btn-ghost">Cancel</button>
            <button className="link-arrow">How it works <ArrowRight /></button>
          </div>
          <div className="sg-row">
            <button className="btn btn-primary btn-sm"><Plus /> Create room</button>
            <button className="btn btn-secondary btn-sm">Join code</button>
            <button className="btn btn-primary" disabled>Disabled</button>
            <button className="icon-btn" aria-label="Notifications"><Bell /></button>
            <button className="icon-btn" aria-label="Search"><Search /></button>
          </div>
        </section>

        {/* 04 Forms */}
        <section className="sg-section">
          <SectionHead number="04" caption="Forms" title="Quiet controls" />
          <div className="sg-grid-2">
            <div className="card card-pad sg-stack">
              <div className="field"><label htmlFor="sg-name">Display name</label><input id="sg-name" className="input" defaultValue="Kush" /></div>
              <div className="field"><label htmlFor="sg-url">Video link</label><input id="sg-url" className="input" placeholder="Paste a YouTube or video link…" /><span className="field-hint">YouTube, Vimeo or any .mp4 link.</span></div>
              <div className="field"><label htmlFor="sg-quality">Default quality</label><select id="sg-quality" className="select"><option>Auto (up to 1080p)</option><option>720p</option></select></div>
              <div className="toggle-row"><span><strong>Auto-resync</strong><br /><span className="muted">Quietly correct drift over 2 seconds</span></span><Toggle checked={autoResync} onChange={setAutoResync} label="Auto-resync" /></div>
              <div className="toggle-row"><span><strong>Notify me</strong><br /><span className="muted">When a friend starts a room</span></span><Toggle checked={notify} onChange={setNotify} label="Notify me" /></div>
              <div className="sg-row" role="group" aria-label="Genre">
                {['Sci-fi', 'Thriller', 'Comedy', 'Animation'].map((g) => (
                  <button key={g} className="chip" aria-pressed={genre === g} onClick={() => setGenre(g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="paper card-pad sg-stack">
              <span className="eyebrow">Admit one</span>
              <h3 className="display-3">Welcome back</h3>
              <p className="muted">Warm-white paper for editorial moments like sign-in.</p>
              <div className="field"><label htmlFor="sg-email">Email</label><input id="sg-email" className="input" type="email" placeholder="you@example.com" /></div>
              <div className="field"><label htmlFor="sg-pass">Password</label><input id="sg-pass" className="input" type="password" defaultValue="hunter22" /></div>
              <button className="btn btn-ink btn-block">Take your seat <ArrowRight /></button>
              <hr className="rule" />
              <p className="muted">New here? <a href="#sg-email">Create an account</a></p>
            </div>
          </div>
        </section>

        {/* 05 Theater pieces */}
        <section className="sg-section">
          <SectionHead number="05" caption="Theater pieces" title={<>The <span className="serif">details</span></>} />
          <div className="sg-grid-2">
            <div className="sg-stack">
              <TicketStub code="7KQ2XD" title="Friday movie night" meta="Interstellar · hosted by Aarav" caption="Live · 4 watching" onClick={() => {}} />
              <TicketStub code="DEMO1" title="Anime binge" meta="Your Name · hosted by Ishaan" caption="Starts 21:30" onClick={() => {}} />
            </div>
            <div className="card card-pad sg-stack">
              <div className="sg-row sg-between"><span className="caption">Seats · 5 of 16</span><SyncIndicator state="synced" /></div>
              <div className="sg-screen-line" aria-hidden="true"><span>Screen</span></div>
              <SeatRow seats={SAMPLE_SEATS} />
              <hr className="rule" />
              <div className="sg-row"><SyncIndicator state="synced" /><SyncIndicator state="syncing" /><SyncIndicator state="offline" /></div>
              <div className="sg-row"><span className="badge badge-live">Live</span><span className="badge">Poll</span><span className="badge badge-info">Intermission</span></div>
              <div className="sg-row">
                <span className="avatar">AR</span><span className="avatar" style={{ background: 'var(--copper-300)', color: 'var(--ink)' }}>ME</span><span className="avatar" style={{ background: 'var(--slate-300)', color: 'var(--ink)' }}>KS<span className="presence" /></span>
              </div>
            </div>
          </div>
        </section>

        {/* 06 Surfaces */}
        <section className="sg-section">
          <SectionHead number="06" caption="Surfaces & light" title="Depth, not decoration" />
          <div className="sg-surfaces">
            <div className="velvet panel-velvet sg-surface"><span className="caption">Velvet</span><p className="muted">Fine nap, lit from above. Sidebars and private boxes.</p></div>
            <div className="curtain panel-velvet sg-surface spotlight-cone"><span className="caption">Curtain + spotlight cone</span><p className="muted">Landing hero and the room stage.</p></div>
            <div className="card sg-surface spotlight edge-light"><span className="caption">Spotlight card</span><p className="muted">Hover me: a copper light and a brass edge follow the cursor.</p></div>
          </div>
        </section>

        {/* 07 States */}
        <section className="sg-section">
          <SectionHead number="07" caption="States" title={<>Empty, loading, <span className="serif">and when things go wrong</span></>} />
          <div className="sg-grid-2">
            <EmptyState number="00" title="No rooms on the marquee yet" action={<button className="btn btn-primary btn-sm"><Plus /> Create a room</button>}>
              Start one and it will appear here, ticket and all.
            </EmptyState>
            <div className="sg-stack">
              <Banner title="The projector lost its connection">Trying to reconnect to the server… your place in the film is saved.</Banner>
              <Banner tone="info" title="Intermission">The host paused the film. It resumes for everyone at once.</Banner>
              <div className="card card-pad sg-stack" aria-label="Loading example">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="sg-row sg-skel-row">
                    <Skeleton width={36} height={36} radius="50%" />
                    <div className="sg-stack-tight" style={{ flex: 1 }}><Skeleton width="60%" height={12} /><Skeleton width="35%" height={10} /></div>
                  </div>
                ))}
              </div>
              <div className="toast" role="status" style={{ position: 'static' }}><Check /> Invite link copied</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sg-foot container">
        <hr className="brass-rule" />
        <div className="sg-row sg-between"><span className="caption">Couchline · a private theater</span><span className="mono muted">tokens.css · base.css · components.css</span></div>
      </footer>
    </div>
  );
}
