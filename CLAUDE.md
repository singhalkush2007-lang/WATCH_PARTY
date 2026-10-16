# Couchline — watch-party web app

A real-time "watch together" app. Users join a room by code or link. Everyone's `<video>` stays in sync (play, pause, seek), with live chat, emoji reactions, host-run polls and host transfer. The owner is a first-year CS student: explain changes simply and avoid jargon.

History: the app was built step by step with Gemini (the full log is `docs/Building a Full-Stack Web App.pdf`, 146 pages, untracked). **The code is the source of truth, not the PDF.** Every Gemini step replaced the whole of `App.jsx`. The current `App.jsx` and `server.js` match Gemini's last full versions (the "polish Settings page" step). The logo step that came after was **never applied**.

## Tech stack
- **Frontend:** React 19 + Vite 8, `react-router-dom` 7, `socket.io-client` 4, `lucide-react` icons. Plain CSS in `App.css`. Tailwind 4 is installed and its Vite plugin is on, but it is **not used** (nothing imports it). Lint: `oxlint`.
- **Backend:** Node (CommonJS), Express 5, Socket.IO 4, `cors`. No database: all state lives in an in-memory `rooms` object.
- No auth, no persistence, no tests, no env config.

## How to run (two terminals)
```bash
cd backend  && node server.js      # http://localhost:3001 (no npm start script)
cd frontend && npm run dev         # http://localhost:5173
```
Restart the backend after editing `server.js` (no nodemon). Lint: `cd frontend && npm run lint`. Build: `npm run build`.
To test sync, open the same `/room/CODE` in a normal window and an incognito window.

## File structure
```
backend/server.js         All Socket.IO event handlers (~75 lines)
frontend/index.html       Loads Google Fonts; <title> is still "frontend"; favicon is the default Vite one
frontend/src/main.jsx     Mounts <App/> and imports App.css
frontend/src/App.jsx      EVERYTHING (~810 lines): socket singleton, DashboardLayout, HomePage,
                          DiscoverPage, MyRoomsPage, FriendsPage, SettingsPage, WatchRoomPage, routes
frontend/src/App.css      Full design system from the Figma file (~640 lines; many classes not used yet)
frontend/vite.config.js   react() + tailwindcss() plugins
docs/                     Gemini chat log PDF (background only)
```
Routes: `/` Home, `/discover`, `/rooms`, `/friends`, `/settings`, `/room/:roomId`.

## Socket.IO events (client → server → room)
| Client emits | Server sends | Notes |
|---|---|---|
| `join-room` roomId | `room-users-update` {users, hostId} to all | First joiner becomes host |
| `video-play` / `video-pause` / `video-seek` {roomId,time} | `sync-play` / `sync-pause` / `sync-seek` to others | Anyone can trigger; no host check |
| `video-sync-heartbeat` {roomId,time} | `sync-heartbeat` to others | Host sends every 2 s; viewers jump if drift > 1.5 s |
| `change-url` {roomId,newUrl} | `sync-url` to all | Only the UI hides this from non-hosts |
| `send-chat` {roomId,text} | `receive-chat` {sender: first 4 chars of socket.id, text} | |
| `send-emoji` {roomId,emoji} | `receive-emoji` | heart / flame / smile / shocked |
| `start-poll` / `update-poll-state` {roomId,pollData} | `receive-poll` / `sync-poll-state` | The client sends the whole poll object with vote counts |
| `transfer-host` {roomId,newHostId} | `room-users-update` | Server checks the sender is the host |
| (disconnect) | `room-users-update` to every room | Host passes to `users[0]` |

Echo-loop guard: `isSyncing` ref is set for 400 ms while applying a remote event, so the `onPlay`/`onPause`/`onSeeked` handlers don't re-broadcast it. The page is gated behind an "Enter Session" button so browsers allow autoplay.

## Feature status
**Working:** create a room (random 6-char code), join by code (`window.prompt`), invite (copies URL, "Copied!" feedback), play/pause/seek sync, host heartbeat drift correction, host changes the video URL, chat, floating emoji reactions, People tab with host crown and "Make Host", polls (host creates 2–5 options, everyone votes, live % bars), Settings tabs switch.

**UI only / fake data:** Home "Featured" and "Live now" (hardcoded; Join goes to a random or `DEMO0-3` room), Discover posters (CSS gradients; click → room named after the first 4 letters of the title), genre chips (don't filter), search bar, bell, "Friends online" sidebar (fake Aarav/Meera, count says 5), the Friends page Add Friend input/button (does nothing), Settings (nothing saves; colour picker and toggle are static; Notifications/Privacy are placeholders), My Rooms (placeholder), Create Room modal (name and Public/Invite-only are thrown away), player icons (Captions/Settings/Maximize), "In sync" badge (always green), "Public room" chip, chat time is always "Now".

**Not built (designed in Figma; CSS classes already exist in App.css):** landing/hero page (it existed early on and was replaced by the dashboard), Sign in / Sign up / Forgot password (`.auth*`, `.strength`), toasts, connection banner (`.conn-banner`), custom scrub bar / heatmap / markers, hype meter, watch queue with voting (`.queue-*`), sync-health stats (`.health-grid`, `.drift-row`), share modal with QR (`.share-*`, `.qr`), typing indicator, timestamped chat (`.msg-ts`), system messages, custom logo (Gemini's `CouchlineLogo` SVG was never added; brand mark is still Lucide `MonitorPlay`).

## Known issues
- **Security:** CORS allows every origin (`app.use(cors())` and `origin: "*"`). The server trusts every client: anyone can play/pause/seek, change the URL, start polls or overwrite vote counts. Nothing checks inputs or limits chat length or rate.
- **Rooms:** if everyone leaves, the room keeps a stale `hostId`, so the next person who joins (even the old host after a refresh) is never host. Rooms are never deleted. Leaving via a link to `/` doesn't leave the socket room, so you still show as "watching" (and maybe host) there.
- **Late joiners** get no current state: no URL, time, play/pause, chat history or active poll.
- **Polls:** votes are counted on the client, so two votes at once can lose one. `handleVote` mutates state. `hasVoted` resets on refresh. A poll can never be ended, so a second poll can't be started.
- Duplicate React keys are possible (`Date.now()` emoji ids, index keys in chat).
- The backend URL `http://localhost:3001` is hardcoded in `App.jsx`, so it won't work on another device or when deployed.
- **Structure:** one huge `App.jsx` with lots of inline `style={{}}` and duplicated code. `backend/package.json` has no start script and the wrong `main`. `lucide-react` is in devDependencies. Tailwind/PostCSS/autoprefixer are unused.
- Lint warning at `App.jsx` `togglePlay` (ternary used as a statement).

## Design system ("Marquee" dark cinema look, from Figma)
All tokens are CSS variables in `:root` in `App.css`. Use them; don't hardcode colours.
- **Surfaces:** `--bg #0b0a0d`, `--bg-raised #121016`, `--surface #17141c`, `--surface-2 #201c26`, `--surface-3 #2a2532`, lines `--line #2e2936` / `--line-strong #433c4e`
- **Text:** `--text #f4efe6` (warm off-white), `--text-2 #c9c1b4`, `--muted #9a9187`
- **Accent amber** (primary buttons, active states, brand mark): `--amber #f5a524`, hover `#ffb944`, ink-on-amber `--amber-ink #1a1205`, `--amber-soft` 12% tint
- **Status:** `--red #ef5a5f` (live), `--green #4cc38a` (in sync / online), `--blue #6aa7ff` (info); each has a `-soft` tint
- **Fonts** (Google Fonts in index.html): display **Big Shoulders Display 800**, uppercase, for brand/poster titles (`.display`, `.brand-name`); body **DM Sans** 400–700; mono **JetBrains Mono** for codes, timers and eyebrows (`.mono`, `.eyebrow`)
- **Shape:** radii `--r-sm 8` / `--r-md 12` / `--r-lg 18` / `--r-xl 24`px, `--shadow`, amber focus `--ring`. 44px minimum touch targets.
- **Components:** `.btn` (+ `-primary/-secondary/-ghost/-danger`, `-sm/-lg/-block`), `.icon-btn`, `.input/.select`, `.field`, `.chip` (`aria-pressed`), `.badge-*`, `.avatar` (+ `.presence`), `.card`, `.modal*`, `.tabs/.tab` (`aria-selected`), `.poll*`, `.msg*`, `.person`, `.poster`, `.movie-grid`
- Responsive breakpoints: 1080 / 960 / 860 / 640px. Respects `prefers-reduced-motion`.
- The brand name is "Couchline". The CSS header still says "Marquee" (the Figma file's name).
