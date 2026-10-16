import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Brand from '../../components/Brand';
import { Stagger, Reveal } from '../../components/motion/Motion';

// The door of the theater. Clicking "Enter" is also what allows the browser
// to start the film with sound later on.
export default function RoomGate({ roomId, onEnter }) {
  return (
    <div className="gate curtain">
      <div className="gate-light spotlight-cone" aria-hidden="true" />
      <header className="gate-top">
        <Brand to="/" />
        <Link to="/" className="link-arrow"><ArrowLeft /> Back to the lobby</Link>
      </header>

      <Stagger className="gate-center" gap={0.12} delay={0.25}>
        <Reveal><span className="caption">Private screening</span></Reveal>
        <Reveal>
          <h1 className="display-hero gate-title">Take your <span className="serif">seat</span></h1>
        </Reveal>
        <Reveal className="gate-ticket-wrap">
          <div className="gate-ticket">
            <div className="gate-ticket-main">
              <span className="caption">Admit one</span>
              <span className="gate-ticket-line">The film starts the moment your host presses play. Sound on.</span>
            </div>
            <div className="gate-ticket-stub">
              <span className="caption">Room</span>
              <span className="gate-ticket-code">{roomId}</span>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <button onClick={onEnter} className="btn btn-primary btn-lg" data-magnetic autoFocus>
            Enter the theater <ArrowRight />
          </button>
        </Reveal>
      </Stagger>
    </div>
  );
}
