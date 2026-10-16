import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tv, Bell, User, Shield, Camera } from 'lucide-react';
import Brand from '../components/Brand';
import { Toggle, EmptyState } from '../components/ui/Primitives';
import { Stagger, Reveal } from '../components/motion/Motion';

const TABS = [
  { name: 'Profile', icon: User },
  { name: 'Playback', icon: Tv },
  { name: 'Notifications', icon: Bell },
  { name: 'Privacy & account', icon: Shield },
];

const CHAT_COLOURS = [
  { name: 'Copper', tone: 'copper' },
  { name: 'Slate', tone: 'slate', selected: true },
  { name: 'Mist', tone: 'mist' },
  { name: 'Warm white', tone: 'paper' },
];

// Like before, these settings are a preview: nothing is saved yet.
export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [autoResync, setAutoResync] = useState(true);

  const onTabKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.name === activeTab);
    const next = TABS[(i + (e.key === 'ArrowDown' ? 1 : TABS.length - 1)) % TABS.length];
    setActiveTab(next.name);
    document.getElementById(`settings-tab-${TABS.indexOf(next)}`)?.focus();
  };

  const activeIndex = TABS.findIndex((t) => t.name === activeTab);

  return (
    <div className="settings">
      <header className="settings-top">
        <button onClick={() => navigate(-1)} className="link-arrow"><ArrowLeft /> Back</button>
        <Brand to="/" size="sm" />
      </header>

      <div className="settings-grid">
        <aside className="settings-aside">
          <span className="caption">Profile & settings</span>
          <h1 className="display-1">Your <span className="serif">box office</span></h1>
          <div className="settings-nav" role="tablist" aria-orientation="vertical" aria-label="Settings sections" onKeyDown={onTabKeyDown}>
            {TABS.map((tab, i) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  id={`settings-tab-${i}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="settings-panel"
                  tabIndex={isActive ? 0 : -1}
                  className="settings-tab"
                  onClick={() => setActiveTab(tab.name)}
                >
                  <span className="settings-tab-num">0{i + 1}</span>
                  <tab.icon aria-hidden="true" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </aside>

        <main id="settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${activeIndex}`} className="settings-panel">
          <Stagger key={activeTab} className="settings-stack" gap={0.07}>
            {activeTab === 'Profile' && (
              <>
                <Reveal className="settings-card card">
                  <div className="settings-card-head">
                    <span className="section-num">01</span>
                    <h2 className="display-3">Profile</h2>
                  </div>
                  <div className="profile-row">
                    <span className="avatar profile-avatar">DV</span>
                    <div className="profile-id">
                      <span className="profile-name">DEV</span>
                      <span className="muted">dev@example.com · member since Oct 2026</span>
                    </div>
                    <button className="btn btn-secondary btn-sm"><Camera /> Change photo</button>
                  </div>
                  <div className="settings-fields">
                    <div className="field">
                      <label htmlFor="display-name">Display name</label>
                      <input id="display-name" type="text" className="input" defaultValue="DEV" />
                    </div>
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" className="input" defaultValue="dev@example.com" />
                    </div>
                  </div>
                  <div className="field">
                    <span className="field-label">Chat colour</span>
                    <div className="swatches" aria-label="Chat colour">
                      {CHAT_COLOURS.map((c) => (
                        <span key={c.tone} className={`swatch tone-${c.tone}${c.selected ? ' is-selected' : ''}`} title={c.name} aria-label={`${c.name}${c.selected ? ' (current)' : ''}`} role="img" />
                      ))}
                    </div>
                  </div>
                  <div className="settings-actions">
                    <button className="btn btn-primary">Save changes</button>
                  </div>
                </Reveal>
              </>
            )}

            {activeTab === 'Playback' && (
              <Reveal className="settings-card card">
                <div className="settings-card-head">
                  <span className="section-num">02</span>
                  <h2 className="display-3">Playback</h2>
                </div>
                <div className="setting-row">
                  <div>
                    <label htmlFor="quality" className="setting-title">Default quality</label>
                    <p className="muted">Lower quality buffers faster on slow Wi-Fi.</p>
                  </div>
                  <select id="quality" className="select setting-control">
                    <option>Auto (up to 1080p)</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <span className="setting-title" id="resync-label">Auto-resync</span>
                    <p className="muted">Quietly correct drift over 500 ms.</p>
                  </div>
                  <Toggle checked={autoResync} onChange={setAutoResync} label="Auto-resync" />
                </div>
              </Reveal>
            )}

            {(activeTab === 'Notifications' || activeTab === 'Privacy & account') && (
              <Reveal>
                <EmptyState number={`0${activeIndex + 1}`} title={`${activeTab} — arriving soon`}>
                  Settings for {activeTab.toLowerCase()} will appear here.
                </EmptyState>
              </Reveal>
            )}
          </Stagger>
        </main>
      </div>
    </div>
  );
}
