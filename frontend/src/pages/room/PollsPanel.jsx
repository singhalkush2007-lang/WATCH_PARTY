import { Plus, X, Check } from 'lucide-react';
import { EmptyState } from '../../components/ui/Primitives';

export default function PollsPanel({
  activePoll, hasVoted, onVote, isHost,
  pollQuestion, onPollQuestionChange, pollOptions, onOptionChange, onAddOption, onRemoveOption, onStartPoll,
}) {
  return (
    <div className="box-scroll">
      {activePoll ? (
        <div className="poll">
          <div className="poll-head">
            <span className="badge badge-live">Poll · live</span>
            <span className="mono muted poll-total">{activePoll.totalVotes} {activePoll.totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
          <p className="poll-q">{activePoll.question}</p>
          <div className="poll-options">
            {activePoll.options.map((opt, idx) => {
              const pct = activePoll.totalVotes === 0 ? 0 : Math.round((opt.votes / activePoll.totalVotes) * 100);
              return (
                <button
                  key={idx}
                  className={`poll-opt${hasVoted ? ' voted' : ''}`}
                  onClick={() => onVote(idx)}
                  disabled={hasVoted}
                >
                  <span className="poll-fill" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden="true" />
                  <span className="poll-text">{opt.text}</span>
                  <span className="pct">{pct}%</span>
                </button>
              );
            })}
          </div>
          {hasVoted && <p className="poll-note"><Check aria-hidden="true" /> Your vote is in</p>}
        </div>
      ) : isHost ? (
        <div className="poll-create">
          <span className="caption">Ask the room</span>
          <div className="field">
            <label htmlFor="poll-q">Question</label>
            <input id="poll-q" type="text" className="input" placeholder="e.g. Snack break after this?" value={pollQuestion} onChange={(e) => onPollQuestionChange(e.target.value)} />
          </div>

          {pollOptions.map((opt, i) => (
            <div key={i} className="field">
              <label htmlFor={`poll-opt-${i}`}>Option {i + 1}</label>
              <div className="poll-option-row">
                <input id={`poll-opt-${i}`} type="text" className="input" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => onOptionChange(i, e.target.value)} />
                {pollOptions.length > 2 && (
                  <button onClick={() => onRemoveOption(i)} className="icon-btn" aria-label={`Remove option ${i + 1}`}><X /></button>
                )}
              </div>
            </div>
          ))}

          {pollOptions.length < 5 && (
            <button onClick={onAddOption} className="link-arrow poll-add"><Plus /> Add option</button>
          )}

          <button
            onClick={onStartPoll}
            className="btn btn-primary btn-block"
            disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim() !== '').length < 2}
          >
            Start poll
          </button>
        </div>
      ) : (
        <EmptyState compact title="No poll on the screen">
          When the host asks the room a question, it appears here and everyone votes live.
        </EmptyState>
      )}
    </div>
  );
}
