# Couchline design v2: plan

Branch: `design-v2` (made from `design-cleanup`, so it keeps the Phase 1 navy ladder, status colours and CLAUDE.md rewrite).
Source of truth: the v2 prompt. Where it disagrees with `docs/DESIGN_GUIDELINES.md` or Phase 1, the prompt wins.
(`docs/DESIGN_GUIDELINES.md` is not in the repo yet. It's only needed for the section 22 check at the end.)

**The idea in one line:** the video is the room. Everything around it is quiet navy and steps back while the film plays. The one bold thing is the **people strip**: friends' faces sitting on the bottom edge of the screen, with reactions rising from the face that sent them.

---

## 1. Tokens (`styles/tokens.css`)

### Colour
| Token | Value | Use |
|---|---|---|
| `--navy-1000` … `--navy-600` | Phase 1 ladder (`#08090C` … `#272D3A`) | Lightness steps = depth |
| `--bg` | `--navy-900` `#111318` | Page |
| `--surface` | `--navy-750` `#1C2029` | Panels (chat panel, lobby rows on hover) |
| `--overlay` | `--navy-600` `#272D3A` | Menus, popovers, toasts, modals |
| `--player-bg` | `#000000` | The player only. Video needs true black. |
| `--text` / `--text-2` | Warm White `#FAF7F2` / Mist `#DCE1E6` | Main / secondary text |
| `--muted` | `#A2AAB8` | Quiet lines (meta, timestamps): 8.5–5.9:1 |
| `--line` / `--line-strong` | warm white 8% / 12% | Hairlines, input edges |
| `--copper` | `#B8734F` | **Only** the one primary button per area, the selected tab, focus rings |
| `--copper-hover` | `#C58D70` | Primary button hover |
| `--ink` | `--navy-1000` | Text on copper (5.3:1) |
| `--danger` `--danger-text` | `#E46C6C` / `#F08B8B` | Errors, "Connection lost" |
| `--success` | `#7DBE8F` | "In sync" dot only |
| `--warning` | `#D9AE5B` | "Reconnecting…" |

Removed: `--info`, `--paper*`, `--brass*`, `--glow*`, `--highlight`, `--accent-soft*`, all `*-rgb` helpers except `--deep-rgb` (used by the scrims over video).

### Type: one family
- **Schibsted Grotesk** 400–700 for everything.
- **Unbounded 600** for the wordmark only, loaded with Google Fonts' `text=Couchline` option, so only those 9 letters download.
- DM Sans, JetBrains Mono and Cormorant are removed.
- Numbers (timecodes, vote counts, room codes, chat times) use the `.num` class (`font-variant-numeric: tabular-nums`), not a monospace font.

| Token | px | Weight / line height | Used for |
|---|---|---|---|
| `--fs-display` | 48 | 600 / 1.1, tracking −0.02em | Landing headline only (30 on phones) |
| `--fs-page` | 30 | 600 / 1.15, −0.015em | One page title per screen |
| `--fs-section` | 20 | 600 / 1.25, −0.01em | Section headings ("Your rooms") |
| `--fs-title` | 17 | 600 / 1.35 | Room title, row titles, film titles |
| `--fs-body` | 15 | 400 / 1.5 | Everything else (base size) |
| `--fs-meta` | 13 | 400–500 / 1.4 | The quieter second line, labels, timestamps |
| `--fs-small` | 12 | 500 / 1.3 | Counts, keyboard keys, hints |

Headings are sentence case. Nothing is set in uppercase except the `?`/`M`/`F` key caps.

### Shape, depth, icons, motion, layout
- **Radius:**
  - `--r-1` 4px: inputs, tags, key caps.
  - `--r-2` 6px: buttons, list rows, menu items.
  - `--r-3` 10px: panels, the player, menus.
  - `50%` for avatars only. **No pills anywhere.** There are no filter chips left, so no pill shape survives.
- **Depth:** lightness steps only. `--shadow-menu` goes on menus, popovers and toasts; `--shadow-modal` is kept for later. No glows, no gradients except the dark scrim under the player controls (it keeps the controls readable on bright video).
- **Icons:** lucide, one global rule: `svg.lucide { width: 18px; height: 18px; stroke-width: 1.75 }`.
  - Used for: player controls, send, nav items, back, more (⋯), close, keyboard (?).
  - Not used: on text buttons ("Create room" has no plus sign), or `Zap`, `Sparkles`, `Rocket`.
  - Reactions are real emoji: ❤️ 🔥 😂 😮.
- **Motion:**
  - `--dur-fast` 100ms: hover, press, focus.
  - `--dur-house` 240ms: house lights and the controls fading.
  - `--dur-reaction` 1800ms: a reaction rising.
  - That's all: no page transitions, no load animations, no pulses.
  - Under reduced motion every duration is 0, and reactions appear above the face and disappear without moving.
- **Focus:** `outline: 2px solid var(--copper); outline-offset: 2px` on every control.
- **Layout:**
  - Page padding 32px, or 16px on phones.
  - Containers `--w-content` 1120px and `--w-read` 68ch.
  - Breakpoints 1100 / 760 / 400px.
  - Touch targets are at least 44px on touch screens (`@media (pointer: coarse)`).

### Components (shared CSS)
- **Primary button:**
  - Copper background, ink text, 15px/500, 40px tall, 6px radius.
  - Hover is `--copper-hover`; press darkens one step, with no movement.
  - At most one per area.
- **Secondary button:** `--navy-700` background, warm-white text. Hover goes to `--navy-600`.
- **Quiet button:** text only in mist. Hover gives a `--navy-750` background.
- **Input:** `--navy-950` background, 1px `--line-strong` border, 4px radius, 40px tall. Hover brightens the border; focus shows the copper outline.
  - The label is always visible above the field, in 13px mist.
  - Errors appear under the field in `--danger-text`, and the field gets `aria-invalid`.
- **Row:**
  - A 6px-radius block with no border; hover gives a `--navy-750` background.
  - A title line (17/600), then a quieter line (13, muted).
  - The action goes on the right.
- **Tabs:** text tabs in mist. The selected one is warm white with a 2px copper underline.
- **Toast:** bottom centre, `--overlay` background, `--shadow-menu`. It echoes the action that just happened and disappears after 2.5s.
- **Avatar:**
  - A circle with one or two initials, in one of four palette tones (`--navy-600` with mist, mist with navy, warm white with navy, `--slate` with warm white), picked from the name, so the same name always gets the same tone.
  - **You** get a 2px warm-white ring.

---

## 2. Global effects removed in step (a)
| What | Where |
|---|---|
| Film grain + vignette (`body::before/::after`), velvet, curtains, spotlight cones | `base.css` |
| Curtain intro, page cross-fade (`Scene`), `MotionConfig`/`LazyMotion` | `App.jsx`, `DashboardLayout.jsx` |
| Fade-up/stagger reveals (`Stagger`, `Reveal`, `InView`) | `components/motion/Motion.jsx` is deleted; every page uses plain elements |
| Magnetic buttons, cursor light (`--mx/--my`, `data-magnetic`, `.spotlight`, `.edge-light`) | `hooks/usePointerEffects.js` is deleted; the attributes and CSS go |
| Lenis smooth scroll, parallax | `LandingPage.jsx`; `npm uninstall lenis motion` |
| Light-bulb marquee, ticket stubs, seat map | `components/ui/Theater.jsx` is deleted (the sync status moves into the room header) |
| Fake CSS poster art | `styles/art.css` is deleted |
| Every `<span className="serif">`, every uppercase tracked label, `01/02` numbers | All pages (the wording itself is rewritten screen by screen in b–e) |
| Hover-lift, scale, glows, gradients, `backdrop-filter` | All `styles/*.css` |

---

## 3. Screens

### 3.1 Room entry (`/room/:code`, before joining)
```
┌──────────────────────────────────────────────┐
│ ← Lobby                                      │
│                                              │
│        Pull up a seat                        │  ← the one pun, here only
│        You're joining room 7KQ2XD.           │
│                                              │
│        Your name                             │
│        [ Sana                       ]        │
│        Shown in chat and next to your        │
│        reactions.                            │
│        [ Join room ]                         │
└──────────────────────────────────────────────┘
```
- The name is remembered on this device (`localStorage`) and prefilled next time.
- The click is also what lets the browser play sound later.
- **Whoever creates a room from the lobby skips this screen** if they already have a name. They just clicked "Create room", they're the host, and they're the one who will press play.
- Everyone else always sees it: it's quick, it confirms their name, and it guarantees the click browsers need before playing sound.

### 3.2 Watch room, desktop (≥1100px)
```
┌────────────────────────────────────────────────────────┬──────────────────┐
│ ← Lobby   Sintel – Open Movie by Blender Foundation    │ Chat  Polls  People 4
│           Room 7KQ2XD   ● In sync      [Copy invite link]│ ────             │
│ ┌────────────────────────────────────────────────────┐ │                  │
│ │                                                    │ │ Sana     9:41 pm │
│ │                    VIDEO (true black)              │ │ anyone else's    │
│ │                                                    │ │ subtitles broken?│
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │                  │
│ │ ▶  12:04 / 14:48            🔊 ───   ⌨   ⛶         │ │ You      9:42 pm │
│ └─(S)(M)(I)(You)─────────────────────── ❤️ 🔥 😂 😮 ─┘ │ nope, fine here  │
│                                                        │                  │
│  Video link   [ Paste a YouTube or video link ] [Load] │ [Message the room]│
│  Only you see this — you're the host.                  │              [↑] │
└────────────────────────────────────────────────────────┴──────────────────┘
```
**Header (about this room, not the app):**
- `← Lobby`.
- The title is the **video's real title**:
  - YouTube: fetched from YouTube's public oEmbed API, which allows browser requests.
  - Direct file: the file name, tidied.
  - Fallback while it loads: "Room 7KQ2XD".
- Under it, a quieter line: the room code in tabular figures, and the status dot.
  - "In sync" (green) when connected.
  - "Reconnecting…" (amber) when not.
- One primary button: **Copy invite link**.
- The brand logo and the avatar stack are removed (the people strip already shows faces).

**Player (`PlayerBox`):**
- True black, 10px radius, as large as the space allows.
- YouTube's own controls are turned off for everyone, and the same setting is kept always, so the player never reloads. Our controls sit over a dark scrim at the bottom:
  - A seek bar: draggable for the host, display only for everyone else.
  - Play/pause: host only; viewers don't get a button they can't use.
  - Time `12:04 / 14:48`, mute and volume, a keyboard-shortcuts button (`?`), and full screen.
  - The host's seek bar sets the player's time, so the existing `onSeeked → video-seek` path broadcasts it. No sync code changes.
- **Controls and cursor fade out after 2.5s** without mouse movement while playing. They come back on movement, a tap or keyboard focus.
- **Overlays:**
  - Before the film starts: host "Press play when everyone's here"; viewers "Waiting for Sana to press play".
  - Paused: host "Paused"; viewers "Paused by Sana".
  - Video error: "This video can't play here".
  - Loading: "Loading video…".
- Viewers clicking the screen, or pressing Space, get a short hint: "Only Sana can play, pause or skip".

**The people strip (`PeopleStrip.jsx`, new), the bold moment:**
- Faces (32px circles) sit **on the bottom edge of the player**, half over the picture and half over the page. It looks like the heads of the row in front of you in a cinema.
- Your own face has the warm-white ring. Up to 8 faces, then "+3".
- On the right of the same edge are the four reaction buttons (❤️ 🔥 😂 😮).
- **A reaction rises from the face of the person who sent it** (one emoji, 1.8s, up and fading).
- When the controls fade out during playback, the strip fades with them. A reaction makes just that person's face appear for the moment, then it fades back. So you always see *who* laughed, and the picture stays clear otherwise.
- In full screen the strip moves inside the bottom of the picture.
- Screen readers get a text summary ("In the room: Sana (host), Meera, you") and labelled reaction buttons ("Send a laugh").

**House lights:**
- While playing and idle for 2.5s, the header, the video link bar and the side panel dim to 55% opacity over 240ms.
- They come back on pause, mouse movement, or keyboard focus inside them.
- This replaces the old always-on dimming.

**Video link (host only, below the player):**
- The label "Video link", then the input, then **Load video** (secondary, because the page's primary is Copy invite link).
- Note under it: "Only you see this — you're the host."
- An invalid link shows an inline error.

**Side panel (`RoomTabs` + panels), 360px:**
- Tabs: **Chat · Polls · People 4**. "Your private box" is gone.
- **Chat:**
  - Consecutive messages from the same person are grouped under one name and time line.
  - Real times ("9:41 pm"), recorded when the message arrives.
  - Your own name shows as "You".
  - Stable message ids instead of index keys.
  - The composer is pinned to the bottom, and Send is the copper primary.
- **Polls:**
  - Host form: Question, then Options 2–5, then **Start poll**.
  - Results: each option is a row with a quiet fill, the count and the percentage in tabular figures. Your choice gets a copper left edge and "You voted for …".
  - There's no LIVE badge.
- **People:** plain list rows with face, name, "Host" or "You", and **Make host** for the host. The seat map is removed.

### 3.3 Watch room, phone (<760px)
```
┌──────────────────────────────┐
│ ←  Sintel – Open Movie…   ⋯  │   ⋯ = Copy invite link · Change video (host)
│ Room 7KQ2XD  ● In sync       │
├──────────────────────────────┤
│        VIDEO (full width)    │
│ ▶ 12:04 / 14:48        🔊 ⛶  │
├──────────────────────────────┤
│ (S)(M)(I)(You)   ❤️ 🔥 😂 😮 │   strip sits under the video here
├──────────────────────────────┤
│ Chat   Polls   People 4      │   sticky
│ messages…                    │   fills the rest
├──────────────────────────────┤
│ [Message the room      ] [↑] │   pinned above the keyboard
└──────────────────────────────┘
```
- The page is a full-height column (`100dvh`). The viewport tag gets `interactive-widget=resizes-content`, so Android shrinks the page for the keyboard and the composer stays visible. On iOS the composer is the last item in the column, so it stays reachable.
- The video link moves into the **⋯ menu** ("Change video" opens the field inside the menu).
- No keyboard-shortcut button on phones.

### 3.4 Lobby (`/`)
```
┌ sidebar ──┬────────────────────────────────────────────────────┐
│ Couchline │ Watch something together                           │
│           │                                                    │
│ Lobby     │ Video link                                         │
│ Discover  │ [ Paste a YouTube or video link         ] [Create room]
│ Rooms     │                                                    │
│ Friends   │ Got a code from a friend?                          │
│           │ [ Room code ] [Join]                               │
│           │                                                    │
│           │ Your rooms                                See all  │
│           │ [thumb] Sintel – Open Movie…                [Open] │
│           │         With Sana and Meera            Yesterday   │
│ (D) DEV   │ [thumb] Room 7KQ2XD                         [Open] │
│           │         Just you                        2 Oct      │
└───────────┴────────────────────────────────────────────────────┘
```
- **Sidebar:**
  - The wordmark, four nav items (icon and label, no numbers), and at the bottom your face and name, which link to Settings.
  - Removed: "The lobby" label, the friends-online list, the fake "5", and the About/Sign in links.
- **No top bar.** Search and the bell don't work, and the lobby itself now holds Create and Join.
- **Create room:**
  - A link is required, and the button is disabled until there is one.
  - It creates the room, takes you in as host (skipping the entry screen if you have a name), and loads the video straight away. The lobby passes the link to the room page, which sends the existing `change-url` event once it knows you're host.
- **Your rooms:** rooms you opened on this device, kept in `localStorage`.
  - Each row: the YouTube thumbnail (or a plain black frame), the title, then a quieter line with who was there ("With Sana and Meera" / "Just you"), and when you were last there.
  - Up to 5 rows, then "See all" goes to /rooms.
  - **The mockup's "Sana · 3 watching" (live counts) isn't possible without a new server endpoint**, which the prompt rules out. I show what this device honestly knows instead.
- **Removed:** the billboard, "Live now" demo rooms, "4 watching", fake avatars, both dialogs (their jobs are now inline).
- **Phone:** the sidebar becomes a bottom tab bar (Lobby, Discover, Rooms, Friends, You). The create/join block stays at the top.

### 3.5 Discover (`/discover`): real, free films
- Instead of fake posters: **Blender Studio's open movies**. They're free to share, and all eight YouTube IDs were checked on YouTube's official Blender channels.
- Editorial list rows: the real YouTube thumbnail (16:9, 6px radius), title, a quieter line with the year, one short sentence, then **Watch together**, which makes a room with that film loaded, as host.
- No genre chips (nothing to filter), no fake runtimes.
- Films:
  - Big Buck Bunny (2008)
  - Elephants Dream (2006)
  - Sintel (2010)
  - Tears of Steel (2012)
  - Cosmos Laundromat (2015)
  - Agent 327: Operation Barbershop (2017)
  - Spring (2019)

### 3.6 Rooms (`/rooms`)
- The same rows as the lobby, but all of them.
- Each row has a ✕ "Remove" (an icon button with a label).
- At the bottom: **Clear list** (quiet button).

### 3.7 Friends (`/friends`): honest version
- No friend accounts exist, so instead this shows **people you've watched with on this device**, collected from the room people lists.
- Each row: face, name, then a quieter line "Last watched together: Sintel", and the date.
- Intro sentence: "There are no accounts yet, so to watch with someone, send them a room link."
- The "Add friend" search is removed (it did nothing).

### 3.8 Settings (`/settings`): only what works
- Settings moves inside the lobby layout, at the same URL, so the sidebar stays.
- One page, three sections:
  1. **Your name:** the field and **Save name**. It saves for real (the same value the entry screen uses).
  2. **This device:** "Couchline remembers 4 rooms and 6 people here." and **Clear history**.
  3. **Keyboard shortcuts:** a list.
- **Removed:** the Playback, Notifications and Privacy tabs, email, photo, chat colours and the resync toggle. None of them did anything.

### 3.9 Sign in / Sign up (`/signin`, `/signup`): honest version
- Both routes stay. Each shows one short card: there are no accounts yet, you don't need one, and **Go to the lobby**.
- The fake form, ticket and quote go. A login form that doesn't log you in is the most misleading thing in the app.

### 3.10 Dialogs
- Create room and Join room are now inline in the lobby, so `RoomDialogs.jsx` is deleted.
- `Modal.jsx` stays only if something still uses it; otherwise it's deleted too.
- The room's ⋯ menu and the shortcuts popover are small anchored menus, not dialogs. They close on Esc and on a click outside, and focus returns to their button.

### 3.11 Landing (`/welcome`)
```
Couchline                                              [Open Couchline]

Movie night, from different hostels.                    ┌───────────────┐
Paste a link, send the room to your friends,            │ real screenshot│
and everyone watches the same second.                   │ of a room      │
                                                        └───────────────┘
Video link [ Paste a YouTube or video link ] [Create room]
Got a code? [ Room code ] [Join]

What happens in a room
The host holds the remote — Play, pause and skip happen for everyone at once.
Faces, not usernames — Reactions rise from whoever sent them, so you see who laughed.
Any link — YouTube or a direct video file. No uploads, no accounts.

Couchline is a student project.            Lobby  Discover
```
- The hero **is** the create form, the same component as the lobby's.
- The picture is a **real screenshot** of a room, captured from the app in step (e) and saved to `src/assets/`.
- No stats, testimonials, feature cards or animated sections.

### 3.12 Styleguide (`/styleguide`, dev only)
Shows:
- The new colour tokens with their contrast ratios.
- The 7-step type scale in Schibsted Grotesk.
- Buttons, inputs with an error, rows, tabs, avatars in all four tones, a people strip, a toast, and the shortcut keys.

---

## 4. All copy

### Room entry
- Heading: "Pull up a seat"
- Line: "You're joining room **7KQ2XD**."
- Field: label "Your name", placeholder "e.g. Sana", hint "Shown in chat and next to your reactions."
- Button: "Join room"
- Error: "Add a name so friends know who's who."

### Room
| Place | Copy |
|---|---|
| Back | "Lobby" (with ← icon) |
| Title fallback | "Room 7KQ2XD" |
| Status | "In sync" / "Reconnecting…" |
| Invite button → toast | "Copy invite link" → "Invite link copied" |
| Clipboard blocked → toast | "Couldn't copy. Copy the link from the address bar." |
| Phone menu | "Room options" (label), items "Copy invite link", "Change video" |
| Before start | host "Press play when everyone's here" · viewer "Waiting for Sana to press play" |
| Paused | host "Paused" · viewer "Paused by Sana" |
| Loading | "Loading video…" |
| Video error | Title "This video can't play here". Host: "It may not allow embedding, or the link may be wrong. Try a different link." Viewer: "It may not allow embedding, or the link may be wrong. Sana can load a different one." |
| Viewer tries controls | "Only Sana can play, pause or skip" |
| Control labels | "Play for everyone" / "Pause for everyone", "Seek", "Mute" / "Unmute", "Volume", "Full screen" / "Exit full screen", "Keyboard shortcuts" |
| Shortcuts popover | "Keyboard shortcuts": Space "Play or pause (host)", M "Mute", F "Full screen", / or Enter "Write a message", ? "Show shortcuts" |
| Reactions (labels) | "Send a heart", "Send fire", "Send a laugh", "Send a gasp" |
| Strip overflow | "+3" (label "3 more people") |
| Video link | Label "Video link", placeholder "Paste a YouTube or video link", button "Load video", note "Only you see this — you're the host.", toast "Video loaded for everyone", error "That doesn't look like a link. It should start with https://" |
| Tabs | "Chat", "Polls", "People" + count |
| Chat empty | "No messages yet. Say hi — everyone in the room sees it instantly." |
| Composer | label "Message the room" (screen readers), placeholder "Message the room", send "Send message" |
| Polls, viewer empty | "The host hasn't started a poll." |
| Poll form | Heading "Ask the room"; "Question" (placeholder "Snack break after this?"); "Option 1"…; "Add option"; "Remove option 3"; "Start poll" → toast "Poll started" |
| Poll results | "5 votes"; after voting "You voted for Yes" |
| People | "Host", "You", button "Make host" → toast "Meera is now the host" |
| Host changes | to you: "You're the host now — Space plays and pauses for everyone." To someone else: "Meera is now the host" |
| Connection lost | "Connection lost. Reconnecting… Your video keeps playing." |
| Back online | "You're back online. Rejoin to catch up with the room." Button "Rejoin room" |

### Lobby
- Heading: "Watch something together"
- Field "Video link", placeholder "Paste a YouTube or video link", button "Create room", error "That doesn't look like a link. It should start with https://"
- Field "Got a code from a friend?", placeholder "Room code", button "Join"
- Section: "Your rooms", link "See all"
- Row: title, then "With Sana and Meera" / "Just you", date ("Today", "Yesterday", "2 Oct"), button "Open"
- Empty: "No rooms yet. Rooms you create or join show up here." Action: "Find a free film" → Discover
- Sidebar: "Lobby", "Discover", "Rooms", "Friends", and your name (or "Set your name")

### Discover
- Heading: "Free films to watch together"
- Intro: "Short films from Blender Studio, free to share. Pick one and a room opens with it ready to play."
- Rows (title, then year, then one line), button "Watch together":
  - Big Buck Bunny, 2008: "A gentle giant rabbit gets even with three bullies."
  - Elephants Dream, 2006: "Two men lost inside an endless, strange machine."
  - Sintel, 2010: "A girl searches for the baby dragon she raised."
  - Tears of Steel, 2012: "Sci-fi in Amsterdam, with real actors and robots."
  - Cosmos Laundromat, 2015: "A sheep on a lonely island meets a salesman selling new lives."
  - Agent 327: Operation Barbershop, 2017: "Agent 327 goes undercover in a barbershop that isn't what it seems."
  - Spring, 2019: "A shepherd girl and her dog face ancient spirits."
- Thumbnail fails to load: a plain black frame with the play icon (no error text needed).

### Rooms
- Heading "Rooms", intro "Rooms you've opened on this device."
- Row actions "Open" and "Remove" (✕) → toast "Removed Sintel from your rooms"
- "Clear list" → toast "List cleared"
- Empty: "No rooms yet. Rooms you create or join show up here." Action: "Go to the lobby"

### Friends
- Heading "Friends", intro "People you've watched with on this device. There are no accounts yet, so to watch with someone, send them a room link."
- Row: name, then "Last watched together: Sintel", date
- Empty: "Nobody here yet. People you watch with will show up here." Action: "Go to the lobby"

### Settings
- Heading "Settings"
- "Your name": field "Name", hint "Shown in chat and next to your reactions.", button "Save name" → toast "Name saved", error "Add a name so friends know who's who."
- "This device": "Couchline remembers 4 rooms and 6 people here." Button "Clear history" → toast "History cleared"
- "Keyboard shortcuts": the same list as the room popover

### Sign in / Sign up
- Heading "There are no accounts yet"
- Text "You don't need one. Create a room, pick a name and send the link — that's it."
- Button "Go to the lobby", link "What is Couchline?"

### Landing
- Nav: "Open Couchline"
- Heading: "Movie night, from different hostels."
- Text: "Paste a YouTube or video link, send the room to your friends, and everyone watches the same second. The host has the remote; everyone else gets chat and reactions."
- Forms: same copy as the lobby ("Got a code?" shortened)
- Section "What happens in a room":
  - "The host holds the remote." "Play, pause and skip happen for everyone at once."
  - "Faces, not usernames." "Reactions rise from whoever sent them, so you see who laughed."
  - "Any link." "YouTube or a direct video file. No uploads, no accounts."
- Footer: "Couchline is a student project." Links "Lobby", "Discover"

---

## 5. Server change (step b only, nothing else in `server.js`)
- `join-room` accepts `{ roomId, name }`; a plain string still works.
  - The name is trimmed and limited to 24 characters; an empty name becomes "Guest".
  - It's stored as `room.names[socket.id]` and deleted on disconnect.
- `room-users-update` adds `names` (`{ [socketId]: name }`).
- `receive-chat` adds `name`.
- `receive-emoji` becomes `{ emoji, senderId, name }`.

## 6. Files, by step
| Step | Files |
|---|---|
| **(a) tokens, fonts, global effects** | `index.html` (fonts, viewport), `styles/tokens.css`, `base.css`, `components.css`; delete `art.css`, `hooks/usePointerEffects.js`, `components/motion/Motion.jsx`, `components/ui/Theater.jsx`; `App.jsx`, `DashboardLayout.jsx`, every page (strip motion wrappers, `data-magnetic`, serif spans, Marquee); `package.json` (remove `motion`, `lenis`); add this plan |
| **(b) room, strip, names** | `backend/server.js` (names only); `pages/room/*`: `WatchRoomPage`, `PlayerBox`, `RoomGate` → entry screen, `RoomHeader`, `RoomTabs`, `ChatPanel`, `PollsPanel`, `PeoplePanel`, new `PeopleStrip`, new `VideoLinkBar` (replaces `NowPlaying`), delete `ReactionBar`; new `lib/identity.js` (name, initials, tone), `lib/videoInfo.js` (title, thumbnail), `lib/history.js` (rooms and people on this device); `styles/room.css` (rewrite); `components/ui/Primitives.jsx` (Banner, EmptyState, Toast) |
| **(c) lobby and sidebar** | `DashboardLayout.jsx`, `HomePage.jsx`, new `components/RoomForms.jsx` (Create + Join, shared with landing), delete `RoomDialogs.jsx` (+ `Modal.jsx` if unused), `styles/lobby.css` |
| **(d) other screens** | `DiscoverPage`, `MyRoomsPage`, `FriendsPage`, `SettingsPage` (+ route moves inside the layout, same URL, in `App.jsx`), `AuthPage`; `discover.css`, `settings.css`, `auth.css` |
| **(e) landing and styleguide** | `LandingPage.jsx`, `landing.css`, `Styleguide.jsx`, `styleguide.css`, `assets/room-screenshot.png` (real capture), `CLAUDE.md` design section |

Each step: `npm run lint` + `npm run build`, screenshots at 375 / 768 / 1280, one commit, stop.

---

## 7. Self-review: what I changed in my own first draft, and why
I read my first draft as if it were any random app's redesign. These parts were generic, so I changed them:

1. **Lobby with two big "action cards"** (Create on a highlighted card, Join on a dark one). That's the default dashboard move.
   - **Now** one sentence-sized form, with the link field first, because pasting a link *is* the task.
2. **Landing = hero + three icon feature cards + call-to-action band.** That's the SaaS template.
   - **Now** the hero *is* the create form, the image is a real screenshot, and the three facts are plain sentences with no icons, no cards and no repeated CTA.
3. **Room header with logo + avatar stack + invite.** Every video-call app has this.
   - **Now** the header is about *this* room (back, the film's real title, the code and invite), and faces live only in the strip, where they mean something.
4. **Settings with four tabs.** That's the tab structure every settings page gets, even when most tabs are empty.
   - **Now** one page with the three things that actually work.
5. **Empty states with an icon, a bold title, a paragraph and two buttons.** That's the illustration-library look.
   - **Now** one plain sentence and one action.
6. **Discover as a grid of identical poster cards that lift on hover.**
   - **Now** an editorial list (Letterboxd-like) of films that really play, each with one honest line.
7. **A shortcuts *modal*.** It's heavy for five lines.
   - **Now** a small popover anchored to the `?` button.
8. **Icons on every button** (plus on Create, ticket on Join, arrow on Enter).
   - **Now** icons only where they speed recognition: player controls, send, nav, back, more and close.
9. **Fake-but-friendly Friends and Sign in pages.** A designer polishing a real product would cut a fake login before anything else.
   - **Now** both say plainly what exists, and Friends shows real people from this device.
10. **A toast for everything.**
    - **Now** toasts only echo something you just did, or tell you that your role changed (becoming host).

What stays deliberately bold: the faces on the screen edge, and reactions rising from the face that sent them. Everything else is meant to be forgettable, so the film isn't.

## 8. Decisions for you to approve
1. **Room title = the video's real title**, not a typed room name. Everyone sees the same thing automatically, and the server stays untouched.
2. **"Your rooms" and "Friends" come from this device's memory.** Live counts like "3 watching" would need a new server endpoint.
3. **Discover becomes a real list of free Blender films** that load straight into a room.
4. **Sign in / Sign up become an honest "no accounts yet" card.** Both routes stay.
5. **YouTube's own controls are turned off** (one setting, never switched, so the player never reloads). The host gets our own seek bar.
6. **Create room needs a link.** A room without a film is an empty cinema; joining by code covers the other case.
