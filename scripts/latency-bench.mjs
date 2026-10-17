// Latency benchmark for the Couchline Socket.IO server.
// No extra packages needed: uses Node 22+'s built-in WebSocket and speaks the Socket.IO v4 protocol directly.
// 1 host + N-1 viewers join a room; the host sends play/pause/seek; we time how long
// until each viewer receives the matching sync event. Also checks late join and host hand-off.
//
// Run (with the backend running in another terminal: `node backend/server.js`):
//   node scripts/latency-bench.mjs                    # 10 users, 300 rounds, localhost
//   USERS=20 ROUNDS=600 node scripts/latency-bench.mjs
//   URL="ws://192.168.1.5:3001/socket.io/?EIO=4&transport=websocket" node scripts/latency-bench.mjs   # over Wi-Fi/LAN
const URL_ = process.env.URL || 'ws://127.0.0.1:3001/socket.io/?EIO=4&transport=websocket';
const USERS = Number(process.env.USERS || 10);
const ROUNDS = Number(process.env.ROUNDS || 300);
const ROOM = 'BENCH' + Math.floor(Math.random() * 1e6);

function client() {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL_);
    const handlers = {};
    const c = {
      ws,
      on: (ev, fn) => { handlers[ev] = fn; },
      emit: (ev, data) => ws.send('42' + JSON.stringify([ev, data])),
    };
    ws.onmessage = (m) => {
      const s = String(m.data);
      if (s === '2') return ws.send('3');           // ping -> pong
      if (s.startsWith('0')) return ws.send('40');   // engine open -> connect namespace
      if (s.startsWith('40')) { c.id = JSON.parse(s.slice(2)).sid; return resolve(c); }
      if (s.startsWith('42')) {
        const [ev, data] = JSON.parse(s.slice(2));
        handlers[ev]?.(data);
      }
    };
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]; };

const host = await client();
host.emit('join-room', ROOM);
await sleep(150);
const viewers = [];
for (let i = 1; i < USERS; i++) { const v = await client(); v.emit('join-room', ROOM); viewers.push(v); }
await sleep(500);

const samples = { play: [], pause: [], seek: [] };
const evMap = { play: ['video-play', 'sync-play'], pause: ['video-pause', 'sync-pause'], seek: ['video-seek', 'sync-seek'] };
const kinds = ['play', 'pause', 'seek'];

for (let r = 0; r < ROUNDS; r++) {
  const kind = kinds[r % 3];
  const [out, inc] = evMap[kind];
  const t0 = performance.now();
  await new Promise((done) => {
    let left = viewers.length;
    for (const v of viewers) {
      v.on(inc, () => { samples[kind].push(performance.now() - t0); if (--left === 0) done(); v.on(inc, null); });
    }
    host.emit(out, { roomId: ROOM, time: r * 1.5 });
  });
  await sleep(20);
}

const all = [...samples.play, ...samples.pause, ...samples.seek];
const fmt = (a) => `n=${a.length} median=${pct(a, 50).toFixed(2)}ms p95=${pct(a, 95).toFixed(2)}ms p99=${pct(a, 99).toFixed(2)}ms max=${Math.max(...a).toFixed(2)}ms`;
console.log(`users=${USERS} rounds=${ROUNDS}`);
for (const k of kinds) console.log(k.padEnd(6), fmt(samples[k]));
console.log('ALL   ', fmt(all));

// Late join: the room is now paused at some time; a new viewer should get room-state immediately.
const lateTimes = [];
for (let i = 0; i < 20; i++) {
  const t0 = performance.now();
  const late = await client();
  await new Promise((done) => { late.on('room-state', () => { lateTimes.push(performance.now() - t0); done(); }); late.emit('join-room', ROOM); });
  late.ws.close();
  await sleep(30);
}
console.log('late-join room-state', fmt(lateTimes));

// Host leaves: does hosting pass to the next user?
let newHost = null;
viewers[0].on('room-users-update', (d) => { newHost = d.hostId; });
host.ws.close();
await sleep(500);
console.log('host-handoff', newHost === viewers[0].id ? 'OK: first viewer became host' : `unexpected hostId=${newHost}`);

for (const v of viewers) v.ws.close();
process.exit(0);
