import { Link } from 'react-router-dom';
import logo from '../assets/family-watching-tv-icon.svg';

// Logo + wordmark. Pass `to` to make it a link.
export default function Brand({ to, size = 'md' }) {
  const className = `brand${size === 'sm' ? ' brand-sm' : ''}`;
  const content = (
    <>
      <span className="brand-mark"><img src={logo} alt="" /></span>
      <span className="brand-name">Couchline</span>
    </>
  );
  return to
    ? <Link to={to} className={className} aria-label="Couchline home">{content}</Link>
    : <span className={className}>{content}</span>;
}
