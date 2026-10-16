import { useRef, useState } from 'react';
import { useNavigate, Link, NavLink, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Settings, Home, Compass, Tv, Users, Bell, Search, Plus, Ticket, User } from 'lucide-react';
import Brand from '../Brand';
import { Scene } from '../motion/Motion';
import { CreateRoomDialog, JoinRoomDialog } from './RoomDialogs';

const NAV_ITEMS = [
  { name: 'Lobby', icon: Home, path: '/' },
  { name: 'Discover', icon: Compass, path: '/discover' },
  { name: 'My rooms', icon: Tv, path: '/rooms' },
  { name: 'Friends', icon: Users, path: '/friends' },
];

const FRIENDS_ONLINE = [
  { initials: 'AR', name: 'Aarav', status: 'Watching Interstellar', tone: 'copper' },
  { initials: 'ME', name: 'Meera', status: 'Watching Interstellar', tone: 'mist' },
];

const newRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const outlet = useOutlet({ openCreateRoom: () => setShowCreateModal(true), openJoinRoom: () => setShowJoinModal(true) });
  const contentRef = useRef(null);

  // Each page starts at the top with the room form reset, as when every page had its own layout
  const resetForNewPage = () => {
    contentRef.current?.scrollTo(0, 0);
    setIsPublic(false);
  };

  const handleCreateRoom = () => navigate(`/room/${newRoomCode()}`);
  const handleJoinRoom = (code) => navigate(`/room/${code.trim().toUpperCase()}`);

  return (
    <div className="lobby">
      <aside className="lobby-side velvet">
        <Brand to="/" size="sm" />

        <nav className="lobby-nav" aria-label="Main">
          <span className="caption">The lobby</span>
          <ul>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.path}>
                <NavLink to={item.path} end className="lobby-link">
                  <span className="lobby-link-num">0{i + 1}</span>
                  <item.icon aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <section className="lobby-friends" aria-label="Friends online">
          <span className="caption">Friends online <span className="lobby-friends-count">5</span></span>
          <ul>
            {FRIENDS_ONLINE.map((f) => (
              <li key={f.name} className="lobby-friend">
                <span className={`avatar avatar-sm tone-${f.tone}`}>{f.initials}<span className="presence" /></span>
                <span className="lobby-friend-text">
                  <span className="lobby-friend-name">{f.name}</span>
                  <span className="lobby-friend-status">{f.status}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="lobby-side-foot">
          <Link to="/settings" className="lobby-profile">
            <span className="avatar tone-slate">KS</span>
            <span className="lobby-profile-text">
              <span className="lobby-profile-name">Kush</span>
              <span className="lobby-profile-sub">Profile & settings</span>
            </span>
            <Settings aria-hidden="true" />
          </Link>
          <div className="lobby-side-links">
            <Link to="/welcome">About Couchline</Link>
            <span aria-hidden="true">·</span>
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
      </aside>

      <div className="lobby-main">
        <header className="lobby-top">
          <span className="lobby-top-brand"><Brand to="/" size="sm" /></span>
          <div className="search-wrap lobby-search">
            <Search aria-hidden="true" />
            <input type="search" className="input" placeholder="Search films, rooms, friends…" aria-label="Search films, rooms and friends" />
          </div>
          <div className="lobby-actions">
            <button className="icon-btn" aria-label="Notifications"><Bell /></button>
            <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary btn-sm"><Ticket /> <span className="hide-sm">Join with code</span></button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm"><Plus /> <span className="hide-sm">Create room</span></button>
          </div>
        </header>

        <div ref={contentRef} className="lobby-content">
          {/* Only the page content cross-fades; the sidebar stays put */}
          <AnimatePresence mode="wait" initial={false} onExitComplete={resetForNewPage}>
            <Scene key={location.pathname}>{outlet}</Scene>
          </AnimatePresence>
        </div>
      </div>

      {/* Phone navigation */}
      <nav className="lobby-tabbar" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end className="tabbar-link">
            <item.icon aria-hidden="true" />
            <span>{item.name}</span>
          </NavLink>
        ))}
        <NavLink to="/settings" className="tabbar-link"><User aria-hidden="true" /><span>You</span></NavLink>
      </nav>

      {showCreateModal && (
        <CreateRoomDialog
          isPublic={isPublic}
          onPublicChange={setIsPublic}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}
      {showJoinModal && <JoinRoomDialog onClose={() => setShowJoinModal(false)} onJoin={handleJoinRoom} />}
    </div>
  );
}
