const TABS = [
  { id: 'Chat', label: 'Chat' },
  { id: 'Polls', label: 'Polls' },
  { id: 'People', label: 'Seats' },
];

// Tabs for the private box. Arrow keys move between tabs.
export default function RoomTabs({ activeTab, onTabChange, peopleCount }) {
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.findIndex((t) => t.id === activeTab);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    onTabChange(next.id);
    document.getElementById(`room-tab-${next.id}`)?.focus();
  };
  return (
    <div className="box-head">
      <span className="caption box-caption">Your private box</span>
      <div className="segmented" role="tablist" aria-label="Private box" onKeyDown={onKeyDown}>
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`room-tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`room-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className="segment"
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              {tab.id === 'People' && <span className="segment-count">{peopleCount}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
