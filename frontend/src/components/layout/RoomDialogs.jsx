import { useState } from 'react';
import { ArrowRight, Globe, Lock, X } from 'lucide-react';
import Modal from '../ui/Modal';

// "Set up your room". Same choices as before: a name and invite-only / public.
export function CreateRoomDialog({ isPublic, onPublicChange, onClose, onCreate }) {
  return (
    <Modal titleId="create-room-title" onClose={onClose} className="modal-wide">
      <div className="modal-head">
        <div className="modal-title">
          <span className="caption">New screening</span>
          <h2 id="create-room-title">Set up your <span className="serif">room</span></h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
      </div>
      <div className="modal-body">
        <p className="muted">Everything here can be changed later from room settings.</p>
        <div className="field">
          <label htmlFor="room-name">Room name</label>
          <input id="room-name" type="text" className="input" defaultValue="Friday movie night" />
        </div>
        <div className="field">
          <span className="field-label" id="privacy-label">Who can come in</span>
          <div className="privacy" role="radiogroup" aria-labelledby="privacy-label">
            <button type="button" role="radio" aria-checked={!isPublic} className="privacy-opt" onClick={() => onPublicChange(false)}>
              <Lock aria-hidden="true" />
              <span className="privacy-text"><strong>Invite only</strong><span>Only people with the link or code</span></span>
            </button>
            <button type="button" role="radio" aria-checked={isPublic} className="privacy-opt" onClick={() => onPublicChange(true)}>
              <Globe aria-hidden="true" />
              <span className="privacy-text"><strong>Public</strong><span>Shows up under Live now</span></span>
            </button>
          </div>
        </div>
        <button onClick={onCreate} className="btn btn-primary btn-lg btn-block" data-magnetic>
          Create room <ArrowRight />
        </button>
      </div>
    </Modal>
  );
}

// "Join with a code". Goes to /room/CODE, exactly like the old prompt did.
export function JoinRoomDialog({ onClose, onJoin }) {
  const [code, setCode] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (code.trim()) onJoin(code);
  };
  return (
    <Modal titleId="join-room-title" onClose={onClose}>
      <div className="modal-head">
        <div className="modal-title">
          <span className="caption">Have a ticket?</span>
          <h2 id="join-room-title">Join with a <span className="serif">code</span></h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
      </div>
      <form className="modal-body" onSubmit={submit}>
        <div className="field">
          <label htmlFor="join-code">Room code</label>
          <input
            id="join-code"
            className="input code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="7KQ2XD"
            autoComplete="off"
            spellCheck="false"
            maxLength={32}
          />
          <span className="field-hint">It's on your host's ticket, or at the end of their invite link.</span>
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!code.trim()}>
          Take your seat <ArrowRight />
        </button>
      </form>
    </Modal>
  );
}
