# Couchline — watch-party web app

A real-time "watch together" app. People join a room by code or link. Everyone's video (YouTube or a direct video link) stays in sync with the host's play, pause and seek. Rooms also have live chat, reactions, host-run polls and host transfer. The owner is a first-year CS student: explain changes simply and avoid jargon.

## Design rules (read first for any UI work)
**All UI work must follow `docs/DESIGN_GUIDELINES.md`.** The design is mid-cleanup on the `design-cleanup` branch, one phase per commit.
- **Tokens:** every colour, size, radius, shadow and duration comes from `frontend/src/styles/tokens.css`. No hex values or one-off pixel sizes anywhere else.
- **Colour:**
  - Warm navy surfaces: `--navy-900` is the page, `--navy-750` the surface; `--navy-1000` to `--navy-600` is the elevation ladder.
  - Text is `--text` (warm white), `--text-2` (mist), `--muted` and `--faint`.
- **Copper** (`--copper`) is the only accent: primary action, selected/active state and focus. Small copper text uses `--accent-text`.
- **Status colours**, never copper:
  - `--danger` (errors, LIVE; small text uses `--danger-text`)
  - `--success` (in sync, online)
  - `--warning` (reconnecting, syncing)
  - `--info`

  Each has a `-soft` 14% tint for backgrounds.
- **Type:**
  - DM Sans for everything; JetBrains Mono (`--font-mono`) for codes, timers and numbers.
  - Unbounded (`--font-brand`, weight 600) for the COUCHLINE wordmark only.
  - Fixed scale: `--fs-display`, `--fs-heading`, `--fs-section`, `--fs-title`, `--fs-body`, `--fs-secondary`, `--fs-caption`, `--fs-label`, `--fs-mono`; line heights `--lh-tight/-snug/-body`; weights `--fw-*`.
- **Shape and depth:**
  - Radii `--r-1` 4px, `--r-2` 6px, `--r-3` 10px. Pills only for toggles, avatars and filter chips.
  - Cards have no shadow; `--shadow-2` is for menus, `--shadow-3` for modals and toasts.
- **Motion:** `--dur-1` 100ms to `--dur-4` 320ms with `--ease-out`, no bounce. All durations become 0 under reduced motion.
- **Layout:** containers `--w-read` (68ch), `--w-content` (1120px), `--w-wide` (1440px). Breakpoints are 1100px, 760px and 400px only.
- **Contrast:** text must be at least 4.5:1 on its surface; the ratios are noted in `tokens.css`.
- **Retired tokens:** the old names (`--fs-hero`, `--r-sm`, `--brass`, `--glow-soft`, …) still exist so older CSS works, but don't use them in new code. They're being removed phase by phase.

## Tech stack
- **Frontend:** React 19 + Vite 8, `react-router-dom` 7, `socket.io-client` 4, `react-player` 3 (YouTube + direct video), `motion`, `lenis`, `lucide-react` icons. Plain CSS in `src/styles/`. The Tailwind Vite plugin is on but unused. Lint: `oxlint`.
- **Backend:** Node (CommonJS), Express 5, Socket.IO 4, `cors`. No database: all state lives in an in-memory `rooms` object.
- No real accounts, no persistence, no automated tests in the repo.

## How to run
Development (two terminals):
```bash
cd backend  && node server.js      # http://localhost:3001 (restart after editing; no nodemon)
cd frontend && npm run dev         # http://localhost:5173
```
Lint: `cd frontend && npm run lint`. Build: `cd frontend && npm run build`.
To test sync, open the same `/room/CODE` in a normal window and an incognito window and click "Enter" in both.

Deployment (one Node service, from the repo root): `npm run build` installs both halves and builds `frontend/dist`. `npm start` runs `backend/server.js`, which serves `frontend/dist` plus Socket.IO on `process.env.PORT || 3001`.

## File structure
```
package.json                 Root scripts: build (frontend + backend install) and start
backend/server.js            Express + Socket.IO. Serves frontend/dist, catch-all → index.html, all socket events
frontend/index.html          Fonts (DM Sans, JetBrains Mono, Unbounded 600), title, favicon
frontend/public/favicon.svg  The logo
frontend/src/
  main.jsx                   Mounts <App/>, imports styles/index.css
  App.jsx                    Routes, page transition, lazy-loaded pages
  lib/socket.js              The one shared socket: io() in production, http://localhost:3001 in dev
  hooks/usePointerEffects.js Cursor spotlight + magnetic buttons
  components/
    Brand.jsx                Logo + wordmark
    layout/DashboardLayout.jsx  Lobby shell: sidebar, top bar, mobile tab bar, opens the room dialogs
    layout/RoomDialogs.jsx   Create room / Join with code dialogs
    ui/Modal.jsx             Accessible dialog (Esc, outside click, focus trap)
    ui/Primitives.jsx        Toggle, SectionHead, EmptyState, Banner, Skeleton
    ui/Theater.jsx           Marquee, TicketStub, SeatRow, SyncIndicator
    motion/Motion.jsx        Scene, Stagger, Reveal, InView, CurtainIntro
  pages/
    HomePage, DiscoverPage, MyRoomsPage, FriendsPage   (inside DashboardLayout)
    SettingsPage, LandingPage, AuthPage, Styleguide
    room/WatchRoomPage.jsx   Room state, socket listeners and ALL the sync logic
    room/PlayerBox.jsx       react-player, controls, participant lock, volume
    room/RoomGate, RoomHeader, NowPlaying, ReactionBar, RoomTabs, ChatPanel, PollsPanel, PeoplePanel
  styles/
    index.css                Imports the rest in order
    tokens.css               ALL design tokens
    base.css, components.css Reset, typography, shared components
    room.css, lobby.css, discover.css, settings.css, landing.css, auth.css, art.css, styleguide.css
docs/                        DESIGN_GUIDELINES.md (design rules); the Gemini chat log PDF is git-ignored
```
Routes:
- `/`, `/discover`, `/rooms` and `/friends` share the lobby layout.
- `/settings`, and `/room/:roomId` (lazy-loaded).
- `/welcome` (landing), `/signin` and `/signup` (lazy-loaded).
- `/styleguide` exists in dev only.

## Socket.IO events
| Client emits | Server does | Notes |
|---|---|---|
| `join-room` roomId | Sends `room-state` {videoUrl, playing, time} **to the joiner only**, then `room-users-update` {users, hostId} to all | Creates the room if needed. If the host isn't in the room, the joiner becomes host. Late joiners start at the right time. |
| `video-play` / `video-pause` / `video-seek` {roomId, time} | `sync-play` / `sync-pause` / `sync-seek` (time) to others | **Host only** (`getRoomIfHost`). Saves the room's playback state. |
| `video-sync-heartbeat` {roomId, time, playing} | `sync-heartbeat` {time, playing} to others | Host only, every 2 s. Viewers jump if more than 2 s off. |
| `change-url` {roomId, newUrl} | `sync-url` to all | Host only. http/https up to 2000 chars. Resets to 0, paused. |
| `send-chat` {roomId, text} | `receive-chat` {sender: first 4 chars of socket.id, text} | No length or rate limit. |
| `send-emoji` {roomId, emoji} | `receive-emoji` | heart / flame / smile / shocked |
| `start-poll` / `update-poll-state` {roomId, pollData} | `receive-poll` / `sync-poll-state` | No host check; the client sends the whole poll with vote counts. |
| `transfer-host` {roomId, newHostId} | `room-users-update` | Server checks the sender is host. |
| (disconnect) | `room-users-update` to every room | Host passes to `users[0]`. |

**Client sync (WatchRoomPage):**
- **Playback state:**
  - `roomPlayback` ref {time, playing, at} is where the room should be.
  - `applyRoomPlayback(maxDrift, force)` moves the player there, pausing before seeking because YouTube keeps playing otherwise.
  - The `isSyncing` ref ignores the player's own events for 1 s after a remote change.
- **Viewers:**
  - A viewer's own play/pause is undone.
  - Their video is `inert`, so they can't click it, and they get their own volume control.
- **Gate:** the room sits behind an "Enter" button so browsers allow autoplay.

## Feature status
**Working:**
- Rooms: create (random 6-char code), join by code dialog or link, invite link copy.
- Video: YouTube or direct links, host-only playback with drift correction, late joiners, full screen.
- Social: chat, reactions, polls, the People list with "Make host".
- Connection banners.

**UI only / fake data:**
- Lobby: the "Live now" and featured rooms (Join goes to `DEMO0-3` or random rooms), the "friends online" sidebar (fake names, count says 5), search and bell.
- Discover: posters are CSS art; clicking goes to a room named after the title; genres don't filter.
- Friends: Add friend does nothing.
- Settings: nothing saves; the profile name "DEV" is hardcoded.
- My Rooms: empty.
- Sign in / Sign up: the form just goes to the lobby.
- Names: everyone in a room is "User xxxx".

## Known issues
- **Security:**
  - CORS allows every origin.
  - Polls aren't host-checked and votes are counted on the client, so two votes at once can lose one.
  - Chat has no length or rate limit.
- **Rooms:**
  - Rooms are never deleted and are lost on restart.
  - Leaving a room by navigating inside the app doesn't leave the socket room.
  - Late joiners don't get chat history or the active poll.
- Duplicate React keys are possible (`Date.now()` reaction ids, index keys in chat).
