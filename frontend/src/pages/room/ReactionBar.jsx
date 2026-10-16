import { Heart, Flame, Laugh, Zap } from 'lucide-react';

const REACTIONS = [
  { name: 'heart', Icon: Heart, label: 'Send love' },
  { name: 'flame', Icon: Flame, label: 'Send fire' },
  { name: 'smile', Icon: Laugh, label: 'Send a laugh' },
  { name: 'shocked', Icon: Zap, label: 'Send a gasp' },
];

export default function ReactionBar({ onReact }) {
  return (
    <div className="reaction-bar" role="group" aria-label="Reactions">
      <span className="caption">Applause</span>
      {REACTIONS.map(({ name, Icon, label }) => (
        <button key={name} className="react-btn" data-reaction onClick={() => onReact(name)} aria-label={label} title={label}>
          <Icon />
        </button>
      ))}
    </div>
  );
}
