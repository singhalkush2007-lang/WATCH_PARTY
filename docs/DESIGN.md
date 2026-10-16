# Couchline — UI/UX Design System Brief ("Midnight Navy + Copper")

> **For Claude Code:** This file is the design specification for restyling the Couchline watch-party app
> (React + Vite in `frontend/`, Node + Express + Socket.io in `backend/`).
> Read the whole file first, then follow **Section 12 (Work plan)**.
> **Restyle only. Do not break any existing functionality** (rooms, video sync, chat, polls, friends,
> settings, Discover, host controls, Socket.io events). If a visual change needs a markup change, keep the
> logic and event handlers exactly as they are.

---

## 1. Brand feel

Couchline is a place to watch together. The mood is **a private screening room at night**: calm, premium,
a little editorial. Not neon, not playful-cartoon.

- Dark, deep navy base. Warm copper is the single "glow" accent, like a lamp in a dark room.
- Big, wide, confident headings. Quiet, readable body text.
- Soft, generously rounded cards (large radii), lots of breathing room.
- Copper is rare and meaningful: primary actions, active states, live indicators. If everything is copper,
  nothing is.

Keywords: executive, premium, cinematic, warm-on-cool, editorial, calm.

---

## 2. Colour palette (source of truth)

| Name | Hex | Role |
|---|---|---|
| **Midnight Navy** | `#18202F` | App background, primary dark surface |
| **Slate Blue** | `#68748A` | Secondary surfaces, borders, muted/secondary text, icons |
| **Mist Gray** | `#DCE1E6` | Light UI backgrounds, dividers on light, secondary text on dark |
| **Warm White** | `#FAF7F2` | Primary text on dark, light "editorial" surfaces, cards on light |
| **Copper Accent** | `#B8734F` | Primary accent: buttons, active tabs, links, live/active states |

### 2.1 Derived tokens (needed so text stays readable)

Measured contrast ratios (WCAG). Body text needs 4.5:1, large text/UI icons need 3:1.

| Pair | Ratio | Verdict |
|---|---|---|
| Warm White on Midnight Navy | 15.3 | Great: main text |
| Mist Gray on Midnight Navy | 12.4 | Great: secondary text |
| Slate Blue `#68748A` on Midnight Navy | 3.5 | **Too low for small text.** Use only for borders/icons/large text |
| Copper `#B8734F` on Midnight Navy | 4.4 | Borderline: OK for large/bold text and UI, not small body text |
| Navy on Copper (button label) | 4.4 | Borderline: use semibold 16px+ labels |
| Warm White on Copper | 3.5 | **Do not use** for text |
| Copper on Warm White | 3.5 | **Do not use** for small text on light |

So add these derived tokens:

| Token | Hex | Use |
|---|---|---|
| `--muted-text` | `#9AA6BA` | Small secondary text on navy (6.6:1) |
| `--copper-bright` | `#D4916A` | Copper text/links on navy (6.3:1) and hover state |
| `--copper-deep` | `#9A5B3A` | Copper text on Warm White / Mist Gray (5.0:1) |
| `--navy-raised` | `#1F2938` | Cards on the navy background |
| `--navy-raised-2` | `#27324A` | Hovered cards, inputs, menus |
| `--navy-line` | `#33405A` | Borders on navy |

### 2.2 CSS variables (put in `frontend/src/App.css`, `:root`)

```css
:root {
  /* Core palette */
  --navy:        #18202F;
  --slate:       #68748A;
  --mist:        #DCE1E6;
  --warm-white:  #FAF7F2;
  --copper:      #B8734F;

  /* Derived */
  --navy-raised:   #1F2938;
  --navy-raised-2: #27324A;
  --navy-line:     #33405A;
  --muted-text:    #9AA6BA;
  --copper-bright: #D4916A;
  --copper-deep:   #9A5B3A;
  --copper-soft:   rgba(184, 115, 79, 0.16);

  /* Status (keep muted, they must not fight the copper) */
  --success: #6FBF9A;
  --danger:  #E07A78;
  --info:    #7FA6D9;

  /* Shape */
  --r-sm: 10px;
  --r-md: 16px;
  --r-lg: 24px;   /* main cards, like the palette cards */
  --r-xl: 32px;
  --r-pill: 999px;
  --shadow: 0 24px 60px rgba(5, 9, 18, 0.55);
  --ring: 0 0 0 3px rgba(212, 145, 106, 0.55);

  --nav-h: 68px;
}
```

### 2.3 Migrating from the existing tokens

The current CSS uses these variable names (from the old amber "dark cinema" theme). Easiest approach:
**keep the old names working** by pointing them at the new values, then migrate gradually.

| Old variable | New value |
|---|---|
| `--bg` | `var(--navy)` |
| `--bg-raised` | `var(--navy-raised)` |
| `--surface` | `var(--navy-raised)` |
| `--surface-2` | `var(--navy-raised-2)` |
| `--surface-3` | `#303C56` |
| `--line` | `var(--navy-line)` |
| `--line-strong` | `var(--slate)` |
| `--text` | `var(--warm-white)` |
| `--text-2` | `var(--mist)` |
| `--muted` | `var(--muted-text)` |
| `--amber` | `var(--copper)` |
| `--amber-hover` | `var(--copper-bright)` |
| `--amber-ink` | `var(--navy)` |
| `--amber-soft` | `var(--copper-soft)` |
| `--red` / `--red-soft` | `var(--danger)` / 14% tint |
| `--green` / `--green-soft` | `var(--success)` / 14% tint |
| `--blue` / `--blue-soft` | `var(--info)` / 14% tint |

Also search the CSS for **hard-coded colours** (e.g. `#f5a524`, `#0b0a0d`, `rgba(245,165,36,…)`,
`rgba(11,10,13,…)`) and replace them with tokens. No raw hex values should remain outside `:root`.

---

## 3. Typography

The reference palette uses a **wide, extended geometric sans in uppercase** for titles and small, quiet
sans for descriptions.

| Role | Font | Notes |
|---|---|---|
| Display / headings | **Unbounded** (Google Fonts), weights 500–700 | Wide, uppercase, slightly tight tracking. Fallback: `"Arial Black", sans-serif` |
| Body / UI | **DM Sans** (keep, already in project) | 400/500/600/700 |
| Codes, timers, room codes | **JetBrains Mono** (keep) | Room codes, timestamps, hex-like labels |

Add to `frontend/index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Type scale:

| Style | Size | Weight | Font | Extras |
|---|---|---|---|---|
| Hero H1 | `clamp(40px, 7vw, 88px)` | 700 | Display | uppercase, line-height 1, letter-spacing 0.01em |
| H2 (section) | `clamp(28px, 4vw, 44px)` | 600 | Display | uppercase |
| H3 (card title) | 20–24px | 600 | Display | uppercase, like "MIDNIGHT NAVY" cards |
| Body | 16px | 400 | DM Sans | line-height 1.55 |
| Small / caption | 13–14px | 400–500 | DM Sans | colour `--muted-text` |
| Label (eyebrow) | 12px | 600 | DM Sans or Mono | uppercase, letter-spacing 0.14em, colour `--copper-bright` |

Rules: long headings in Unbounded get wide fast, so use `overflow-wrap: anywhere` and reduce size on mobile.
Never use Display font for paragraphs.

---

## 4. Layout, spacing and shape

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 72 px. Do not invent other values.
- **Container:** max-width 1240px, 24px side padding (16px on mobile).
- **Cards:** background `--navy-raised`, 1px border `--navy-line`, radius `--r-lg` (24px), padding 24–28px.
  The palette reference uses very rounded, full-width stacked cards with the title top-left, a small
  description under it, and a metadata line at the bottom. Reuse this "stacked card" pattern for room cards,
  settings sections and friend rows.
- **Light surfaces:** use Warm White `#FAF7F2` cards with navy text for emphasis blocks (e.g. the "Create
  room" call-to-action, the pricing/feature highlight, modals on auth). Do not mix more than one light card
  per screen section.
- **Icons:** thin-line style (1.5–2px stroke), Lucide icons, `currentColor`. Slate for idle, Warm White
  on hover, Copper-bright when active.
- **Background texture (optional, subtle):** a faint radial glow of copper at ~8–12% opacity behind hero
  areas and the video stage; a very light noise overlay at 3–4% opacity. Keep performance in mind.

---

## 5. Components

Build/restyle these as reusable classes (keep the existing class names where possible).

**Buttons**
- Primary: background `--copper`, text `--navy`, semibold 16px, height 48px, radius `--r-md`. Hover:
  `--copper-bright`. Active: translateY(1px). Disabled: 50% opacity.
- Secondary: background `--navy-raised-2`, 1px border `--navy-line`, text Warm White. Hover: border `--slate`.
- Ghost: transparent, text Mist Gray. Hover: background `--navy-raised`.
- Danger: `--danger` at 14% background, danger text, 1px danger border at 30%.
- On a light (Warm White) card: primary button = Navy background with Warm White text.
- Minimum touch target 44px.

**Inputs**: height 48px, background `--navy` (slightly darker than the card), 1px `--navy-line` border,
radius `--r-md`, placeholder `--slate` (placeholder only), focus: border `--copper-bright` + `--ring`.
Error: `--danger` border and a message under the field. Labels 14px semibold Mist Gray.

**Chips / filters**: pill shape, 36px tall, border `--navy-line`; selected chip = copper background with
navy text.

**Badges**: small pills. "Live" = danger tint with a pulsing dot; "Public" = info tint; "Private" =
slate tint; "Host" = copper tint.

**Navbar**: sticky, height 68px, background `rgba(24,32,47,0.82)` with backdrop blur, bottom border
`--navy-line`. Logo (SVG from `frontend/src/assets/logo.svg`) + wordmark "COUCHLINE" in Display font on the
left, links centre/right, avatar menu on the far right. Active link: copper-bright text with a 2px copper
underline.

**Sidebar (dashboard)**: Midnight Navy, 1px right border, items with icon + label, active item has
`--copper-soft` background, copper-bright icon and text, radius `--r-md`.

**Modals/menus**: `--navy-raised-2` background, `--r-xl` radius, strong shadow, backdrop
`rgba(8,12,20,0.72)`. Close on Esc and on backdrop click.

**Toasts**: bottom centre, `--navy-raised-2`, left icon coloured by status.

**Avatars**: circular. Use palette tints (slate, mist, copper, warm white) with navy initials; no random
rainbow colours.

**Room cards** (stacked-card pattern): room name in Display font, uppercase; a muted line with host
and viewer count; a bottom row with the room code in Mono + Public/Private badge + a Join button.

**Poll**: question in Warm White; options as full-width rows; the chosen option gets a copper left bar and
a progress fill in `--copper-soft`; the percentage in Mono. Host-only controls clearly separated.

**Chat**: own messages on `--copper-soft` background, others on `--navy-raised-2`; usernames in
copper-bright; timestamps in Mono 11px muted.

**Video stage**: black-navy frame, `--r-lg` radius, 1px border, soft shadow, controls over a gradient from
transparent to navy. Progress bar in copper. "Synced" pill in success green.

---

## 6. Pages and UX

Apply the system to every screen. Keep existing routes and features.

1. **Landing**: dark navy hero. Big uppercase headline ("WATCH TOGETHER. FEEL CLOSER." or whatever the
   current copy is, keep the existing copy), copper CTA + secondary CTA, a mock video stage with the logo
   family-on-couch illustration or a screenshot. A "how it works" three-step row and feature cards.
2. **Auth (login/signup)**: split layout. Left: branded panel with a quote and the logo. Right: a
   **Warm White** form card with navy text and a navy primary button, for contrast and an "editorial" feel.
   Show password strength using slate → copper → success.
3. **Home dashboard / lobby**: greeting in Display font; two large action cards: "Create room" (copper
   or Warm White emphasis card) and "Join with code" (navy card). Below: "Your rooms" and "Live now" using
   the stacked room cards.
4. **Discover**: search bar + filter chips + movie/room grid with rounded posters. Hover reveals actions.
   Include empty and loading (skeleton) states.
5. **Room**: video stage (left, large), side panel (right) with tabs: Chat, Polls, People. Host controls
   (change video, link input, kick, end room) in a clearly labelled section visible only to the host.
6. **My Rooms / Friends**: lists using stacked rows; "Add friend" is a prominent button that opens a
   modal; friend rows show an online dot (success green).
7. **Settings / Profile**: left tab list, right content cards, toggle switches (copper when on, slate when
   off), avatar picker, form fields aligned on a 2-column grid on desktop.

Every list needs **empty**, **loading** and **error** states styled with the system.

---

## 7. Motion

- Durations: 150ms for hover/press, 200–250ms for modals/menus, 300ms max for page elements.
- Easing: `ease-out`. Animate only `opacity`, `transform`, `background-color`, `border-color`.
- Subtle: card hover = translateY(-2px) + border brightens. Live dot = slow pulse.
- Respect `prefers-reduced-motion: reduce`: remove transforms and pulses.

---

## 8. Accessibility (required)

- Meet the contrast rules in section 2.1. **Never** put small text in `--slate` or `--copper` on navy,
  and never Warm White text on copper.
- Visible focus ring on every interactive element (`:focus-visible { box-shadow: var(--ring) }`).
- Icon-only buttons need `aria-label`. Modals trap focus and close on Esc.
- Do not rely on colour alone (e.g. poll results also show numbers, status badges also have text).
- All interactive targets at least 44×44px.

---

## 9. Responsive

Breakpoints: 1080, 960, 860, 640 px (keep the existing ones). On mobile: the sidebar collapses into a
bottom tab bar or drawer, the room layout stacks (video on top, tabs below), cards go single column,
headings scale down via `clamp()`. No horizontal scrolling at 360px width.

---

## 10. Do and don't

**Do**
- Use copper only for primary actions, active states and "live" highlights.
- Keep lots of space around cards and use big radii.
- Use Display font in uppercase for titles only.

**Don't**
- Don't add new colours outside this palette (plus the derived tokens and muted status colours).
- Don't use pure black `#000` or pure white `#fff`. Use Navy and Warm White.
- Don't put small text in Slate Blue on Navy.
- Don't use gradients other than the subtle copper glow and the video control fade.
- Don't change Socket.io events, state logic or routes.

---

## 11. Assets

- Logo: `frontend/src/assets/logo.svg` (family on a couch watching TV). It is multi-colour, so do not put
  it on an amber/copper square. Show it on a transparent background at 36–48px in the navbar, larger on
  auth. Also use it as `frontend/public/favicon.svg`.
- Icons: `lucide-react`.

---

## 12. Work plan for Claude Code

Work in this order and **stop for my review after step 3**:

1. Read the project and this file. Summarise in a few lines what exists and what will change. Do not edit
   yet.
2. Update `index.html` (fonts) and `App.css` `:root` (tokens from section 2.2, with the old-name
   mapping from 2.3). Replace hard-coded colours. Run the app and make sure nothing is broken.
3. Restyle global components: buttons, inputs, chips, badges, navbar, sidebar, cards, modals, toasts.
   **Pause here and tell me how to see the result.**
4. Restyle pages in this order: Auth, Dashboard/Lobby, Room, Discover, My Rooms/Friends, Settings.
5. Add empty/loading/error states, motion and reduced-motion rules.
6. Responsive pass at 1440, 1024, 768 and 390px.
7. Accessibility pass (contrast, focus rings, aria-labels, keyboard use).
8. Update `CLAUDE.md` with a short summary of the design tokens and rules.

After each step: tell me what changed, which files were touched, and how to test it. Don't commit to git
unless I ask.

### Acceptance checklist

- [ ] No amber/old colours left; no raw hex outside `:root`
- [ ] Every screen uses the palette and fonts above
- [ ] All text meets contrast rules; focus rings visible
- [ ] Rooms, video sync, chat, polls, friends and settings all still work (test with two browser tabs)
- [ ] No horizontal scroll at 360px
- [ ] Empty, loading and error states exist for lists
