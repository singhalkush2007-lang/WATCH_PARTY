# Couchline 🎬

**Watch videos together, in sync.** Couchline is a real-time watch-party web app: create a room, share the code or link, and everyone's video plays, pauses and seeks together with the host, with live chat, emoji reactions, polls and host transfer on the side.

Built for the **VinnovateIT recruitment task: Watch Party**.

> **Live demo:** _add your deployed link here_
> **Try it locally:** open the same room in a normal window and an incognito window, click **Enter** in both, and press play in the host window.

---

## Features

### Rooms
- Create a room (random 6-character code) or join one with a code or an invite link.
- One-click invite link copy.
- The first person in a room is the **host**. Hosting can be handed to anyone from the **People** tab ("Make host").
- If the host leaves, hosting passes automatically to the next person in the room.

### Synchronised playback
- Works with **YouTube links** and **direct video links** (`.mp4` and similar).
- **Play, pause and seek** by the host are sent to everyone instantly.
- **Late joiners** start at the right moment: the server keeps the room's playback position and sends it to anyone who joins.
- **Automatic drift correction:** the host sends a heartbeat every 2 seconds and viewers who have drifted are snapped back.
- Viewers can't accidentally break sync: their player is locked (`inert`), and if they press play or pause themselves it is undone. They still get their own volume control and full screen.
- The host can change the video for the whole room.

### Watching together
- **Live chat**
- **Emoji reactions** that float across the screen (❤️ 🔥 😂 😮)
- **Group polls** started from the Polls tab, with live vote counts
- **Connection banners** that show when you go offline and when you're reconnected

### Lobby
- Home, Discover, My Rooms, Friends and Settings pages with a full design system ("Midnight Navy + Copper").
- Note: some lobby content is **demo/UI-only** for now (see [Current limitations](#current-limitations)).

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, `react-player` (YouTube + direct video), `socket.io-client`, Motion, Lucide icons, plain CSS with design tokens |
| Backend | Node.js, Express 5, Socket.IO 4 |
| Storage | In-memory (no database): rooms live in the server's memory |
| Deployment | One Node service: Express serves the built React app and Socket.IO on the same port |

---

## Run it locally

You need **Node.js 18+** (Node 22+ to run the latency benchmark).

**Development (two terminals):**
```bash
# Terminal 1: backend on http://localhost:3001
cd backend
npm install
node server.js

# Terminal 2: frontend on http://localhost:5173
cd frontend
npm install
npm run dev
```

**Production build (one service, as deployed):**
```bash
npm run build    # installs both halves and builds frontend/dist
npm start        # serves the app + Socket.IO on $PORT (default 3001)
```

---

## How sync works

The **host is the source of truth**. Viewers never send playback commands; they only follow.

```
Host player ──play/pause/seek──▶ Server ──sync-play/pause/seek──▶ Every viewer
     │                          (saves room state:                   │
     └──heartbeat every 2 s──▶   time, playing, timestamp) ──▶ drift check & correct
```

1. **Host actions.** When the host plays, pauses or seeks, the client emits `video-play`, `video-pause` or `video-seek` with the current time. The server checks the sender really is the host, saves `{ time, playing, updatedAt }` for the room, and broadcasts the event to everyone else.
2. **Applying a change.** Each viewer stores where the room *should* be (`time`, `playing`, and when that was true). For a playing room the expected position is `time + (now − updatedAt)`. The viewer's player is moved there if it is more than **0.5 s** off. Play and pause are always applied.
3. **Drift correction.** Every **2 s** the host sends a heartbeat (`video-sync-heartbeat`) with its exact position. Viewers compare their own position with the expected one and jump back into sync if they are more than **2 s** off. Small differences are ignored on purpose, because constant tiny seeks make video stutter.
4. **Echo protection.** After a remote change, the viewer ignores its own player's events for 1 s (`isSyncing`), so applying a sync never gets sent back to the room as a new action.
5. **Late joiners.** On `join-room` the server replies to the joiner only with `room-state`: the current URL, whether it's playing, and the *live* position (`saved time + time elapsed since`). The joiner seeks there as soon as the video loads.
6. **Autoplay.** Browsers block autoplay with sound, so every room starts with an **Enter** gate. That click counts as the user interaction browsers require.

### Socket.IO events

| Client sends | Server does | Who can send |
|---|---|---|
| `join-room` | Replies `room-state` to the joiner, broadcasts `room-users-update` | Anyone |
| `video-play` / `video-pause` / `video-seek` | Saves state, broadcasts `sync-play` / `sync-pause` / `sync-seek` | Host only |
| `video-sync-heartbeat` | Saves state, broadcasts `sync-heartbeat` | Host only |
| `change-url` | Validates the URL (http/https, ≤ 2000 chars), broadcasts `sync-url` | Host only |
| `transfer-host` | Updates host, broadcasts `room-users-update` | Host only |
| `send-chat` / `send-emoji` | Broadcasts `receive-chat` / `receive-emoji` | Anyone |
| `start-poll` / `update-poll-state` | Broadcasts `receive-poll` / `sync-poll-state` | Anyone |
| *(disconnect)* | Removes the user; passes host to the next user | — |

---

## Latency measurements

The task requires: **≥ 10 users per room**, **playback control propagation ≤ 250 ms at p95 on a local network**, and **drift ≤ 500 ms after correction**.

### How it's measured

`scripts/latency-bench.mjs` simulates a room with **1 host + 9 viewers** (configurable). The host sends play, pause and seek commands in rotation, and the script measures the time from the host sending the command to **each viewer receiving** the matching sync event. It also measures late-join time and checks host hand-off.

```bash
node backend/server.js                               # terminal 1
node scripts/latency-bench.mjs                       # terminal 2: 10 users, 300 rounds
USERS=20 ROUNDS=600 node scripts/latency-bench.mjs   # bigger room
```

It needs no extra packages (it uses Node 22's built-in WebSocket).

### Results

| Test | Users | Samples | Median | p95 | Target |
|---|---|---|---|---|---|
| Play / pause / seek propagation | 10 | _fill in_ | _fill in_ | _fill in_ | ≤ 250 ms p95 |
| Play / pause / seek propagation | 20 | _fill in_ | _fill in_ | _fill in_ | ≤ 250 ms p95 |
| Late join → room state received | — | 20 | _fill in_ | _fill in_ | — |
| Host leaves → next user becomes host | 10 | — | — | — | ✅ / ❌ |

**Test conditions:** _device and OS, e.g. "Windows 11 laptop, Ryzen 5, 16 GB RAM"_; Node _version_; server and clients on _the same machine (localhost) / the same Wi-Fi network_.

### Drift after correction

- After a **play, pause or seek**, every viewer is moved to within **0.5 s** of the host.
- Between commands, the heartbeat corrects any viewer that drifts more than **2 s**. Normal playback on the same network drifts far less than this, so the heartbeat mostly catches stalls and buffering.
- To guarantee ≤ 500 ms drift at all times, the heartbeat threshold can be lowered from `2` to `0.5` in `WatchRoomPage.jsx` (`applyRoomPlayback(2)`). It's kept at 2 s by default to avoid stutter on slow connections.

---

## Failure handling

| Situation | What happens |
|---|---|
| **Late join** | The server sends the live position, so the new viewer starts at the right moment. |
| **Host leaves or disconnects** | Hosting passes automatically to the next user, and everyone's People list updates. |
| **Everyone leaves, then someone rejoins** | The first person back becomes host, and the room keeps its video and position. |
| **Viewer tries to control the video** | Their player is locked, and any play or pause they trigger is undone. |
| **Non-host sends a playback command** | The server ignores it (`getRoomIfHost` check). |
| **Bad video URL** | Rejected unless it is http/https and at most 2000 characters. |
| **Connection drops** | A banner shows "offline", then "reconnected"; Socket.IO reconnects automatically. |
| **Sync loops** | Events caused by applying a remote change are ignored for 1 s. |
| **Two people act at once** | Only the host can control playback, so there is a single source of truth and no conflicting commands. |

---

## Current limitations

Being honest about what's not finished yet:

- **Reconnect doesn't rejoin the room automatically.** After a network drop, Socket.IO reconnects with a new connection, but the client doesn't send `join-room` again, so a refresh is needed. Fix: re-emit `join-room` on the `connect` event.
- **No persistence.** Rooms live in memory, are lost when the server restarts, and are never cleaned up.
- **Late joiners** don't receive past chat messages or the currently open poll.
- **Polls** aren't host-checked on the server, and votes are counted on the client, so two votes at the same instant can overwrite each other.
- **Chat** has no length or rate limit, and names are shown as "User xxxx" (there are no accounts).
- **UI-only pages:** the lobby's "Live now" rooms, Discover, Friends, Settings, and Sign in / Sign up use demo data and don't save anything yet.
- **No automated tests** apart from the latency benchmark.

## Roadmap

- Auto-rejoin on reconnect, plus chat history and the active poll for late joiners
- Server-side poll voting (one vote per user, counted on the server)
- Usernames, and real Friends and My Rooms
- Shared playlists and real movie search with filters on Discover
- Redis for room state, so rooms survive restarts and the app can scale to multiple servers

---

## Project structure

```
package.json            Root build/start scripts (one-service deploy)
backend/server.js       Express + Socket.IO: rooms, host checks, all real-time events
frontend/src/
  App.jsx               Routes
  lib/socket.js         Shared Socket.IO connection
  pages/room/           Watch room: WatchRoomPage (all sync logic), PlayerBox, Chat, Polls, People, Reactions
  pages/                Lobby, Discover, Friends, Settings, Landing, Auth
  components/           Layout, dialogs, UI primitives, motion
  styles/tokens.css     Design tokens (colours, type, spacing, motion)
docs/                   Design system and design plan
scripts/latency-bench.mjs  Latency benchmark
```

---

Made by **Kushagra Singhal**, first-year B.Tech CSE, VIT Vellore · [GitHub](https://github.com/singhalkush2007-lang) · [LinkedIn](https://www.linkedin.com/in/kushagra-singhal-14112429b)
