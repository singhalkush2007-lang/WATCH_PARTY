import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { EmptyState } from '../../components/ui/Primitives';

export default function ChatPanel({ chatMessages, myUserId, chatInput, onChatInputChange, onSend }) {
  const listRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [chatMessages.length]);

  return (
    <>
      <div className="box-scroll chat-list" ref={listRef} aria-live="polite">
        {chatMessages.length === 0 ? (
          <EmptyState compact title="The lights are down">Say hello. Everyone in the room sees it instantly.</EmptyState>
        ) : (
          chatMessages.map((msg, idx) => {
            const mine = msg.sender === myUserId;
            return (
              <div key={idx} className={`msg${mine ? ' mine' : ''}`}>
                <span className="avatar avatar-sm">{msg.sender.substring(0, 2).toUpperCase()}</span>
                <div className="msg-body">
                  <div className="msg-head">
                    <span className="msg-name">{mine ? 'You' : `User ${msg.sender}`}</span>
                    <span className="msg-time">now</span>
                  </div>
                  <p className="msg-text">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={onSend} className="composer">
        <label htmlFor="chat-input" className="sr-only">Message the room</label>
        <input id="chat-input" type="text" value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} placeholder="Message the room…" className="input" autoComplete="off" />
        <button type="submit" className="composer-send" aria-label="Send message"><ArrowUp /></button>
      </form>
    </>
  );
}
