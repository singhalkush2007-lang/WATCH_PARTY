import { AlertTriangle, Info } from 'lucide-react';

// Accessible on/off switch with a brass knob
export function Toggle({ checked, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      className="toggle"
      onClick={() => onChange?.(!checked)}
    />
  );
}

// Numbered editorial heading: 01 · CAPTION · Title
export function SectionHead({ number, caption, title, as: Heading = 'h2', className = '' }) {
  return (
    <div className={`section-head ${className}`}>
      {number && <span className="section-num" aria-hidden="true">{number}</span>}
      {caption && <span className="caption">{caption}</span>}
      <Heading className="display-2">{title}</Heading>
    </div>
  );
}

// Shown when a list has nothing in it
export function EmptyState({ number, title, children, action, compact = false }) {
  return (
    <div className={`empty-state${compact ? ' is-compact' : ''}`}>
      {number && <span className="section-num">{number}</span>}
      <p className="empty-state-title">{title}</p>
      {children && <p className="empty-state-text">{children}</p>}
      {action}
    </div>
  );
}

// Error (announced right away) or info (announced politely) message
export function Banner({ tone = 'error', title, children, action }) {
  const Icon = tone === 'error' ? AlertTriangle : Info;
  return (
    <div className={`banner${tone === 'info' ? ' is-info' : ''}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div className="banner-body">
        {title && <span className="banner-title">{title}</span>}
        {children && <span className="banner-text">{children}</span>}
      </div>
      {action}
    </div>
  );
}

// Navy shimmer placeholder while something loads
export function Skeleton({ width = '100%', height = 16, radius, className = '', style }) {
  return (
    <span
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
    />
  );
}
