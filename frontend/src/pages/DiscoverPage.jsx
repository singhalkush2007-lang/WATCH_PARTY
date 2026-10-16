import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHead, EmptyState } from '../components/ui/Primitives';
import { Stagger, Reveal } from '../components/motion/Motion';

// Same six films as before. Clicking one still starts the room named after
// the first four letters of the title (e.g. /room/INTE).
const POSTERS = [
  { title: 'Interstellar', year: '2014', genre: 'Sci-fi', runtime: '2h 49m', art: 1, line: 'A ringed planet, a long way from home.' },
  { title: 'Arrival', year: '2016', genre: 'Sci-fi', runtime: '1h 56m', art: 2 },
  { title: 'The Martian', year: '2015', genre: 'Sci-fi', runtime: '2h 24m', art: 3 },
  { title: 'Spirited Away', year: '2001', genre: 'Animation', runtime: '2h 5m', art: 4 },
  { title: 'Get Out', year: '2017', genre: 'Thriller', runtime: '1h 44m', art: 5 },
  { title: '3 Idiots', year: '2009', genre: 'Comedy', runtime: '2h 50m', art: 6 },
];

const GENRES = ['Sci-fi', 'Thriller', 'Comedy', 'Animation'];

export default function DiscoverPage() {
  const navigate = useNavigate();

  return (
    <div className="discover">
      <header className="discover-head">
        <SectionHead number="02" caption="Discover" title={<>Tonight's <span className="serif">selection</span></>} as="h1" />
        <div className="discover-intro">
          <p className="lede">Find something everyone will actually agree on. Choose a film to open a room for it.</p>
          <ul className="genre-list" aria-label="Genres in tonight's selection">
            {GENRES.map((g, i) => <li key={g} className={`genre${i === 0 ? ' is-lead' : ''}`}>{g}</li>)}
          </ul>
        </div>
      </header>

      {POSTERS.length === 0 ? (
        <EmptyState title="The projection booth is empty">No films to show right now. Check back later.</EmptyState>
      ) : (
        <Stagger className="poster-wall" gap={0.07} delay={0.1}>
          {POSTERS.map((p, i) => (
            <Reveal key={p.title} className={`poster-cell${i === 0 ? ' is-feature' : ''}`}>
              <button
                type="button"
                className="poster edge-light"
                onClick={() => navigate(`/room/${p.title.substring(0, 4).toUpperCase()}`)}
                aria-label={`Start a room for ${p.title} (${p.year})`}
              >
                <span className={`art art-${p.art}`} aria-hidden="true" />
                <span className="poster-scrim" aria-hidden="true" />
                <span className="poster-index mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="poster-meta">
                  <span className="poster-kicker"><span>{p.genre}</span><span>{p.year}</span><span>{p.runtime}</span></span>
                  <span className="poster-title">{p.title}</span>
                  {p.line && <span className="poster-line serif">{p.line}</span>}
                  <span className="poster-cta">Start a room <ArrowRight aria-hidden="true" /></span>
                </span>
              </button>
            </Reveal>
          ))}
        </Stagger>
      )}
    </div>
  );
}
