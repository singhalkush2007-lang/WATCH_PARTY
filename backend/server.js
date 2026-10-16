const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const DEFAULT_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

// Store room hosts, users and what the room is watching
const rooms = {};

// Where the video is right now: the saved time, plus however long it has been playing since we saved it
const getCurrentTime = (room) => {
  if (!room.playing) return room.time;
  return room.time + (Date.now() - room.updatedAt) / 1000;
};

const savePlayback = (room, time, playing) => {
  room.time = Math.max(0, Number(time) || 0);
  room.playing = playing;
  room.updatedAt = Date.now();
};

// Only the room's host may control the video
const getRoomIfHost = (socket, roomId) => {
  const room = rooms[roomId];
  return room && room.hostId === socket.id ? room : null;
};

const isValidVideoUrl = (url) => {
  if (typeof url !== 'string' || url.length > 2000) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], hostId: socket.id, videoUrl: DEFAULT_VIDEO_URL, playing: false, time: 0, updatedAt: Date.now() };
    }
    const room = rooms[roomId];
    if (!room.users.includes(socket.id)) {
      room.users.push(socket.id);
    }
    // If everyone had left, the old host is gone, so whoever joins first becomes host again
    if (!room.users.includes(room.hostId)) {
      room.hostId = socket.id;
    }

    // Tell the person joining what is playing and where, so late joiners start in the right place
    socket.emit('room-state', { videoUrl: room.videoUrl, playing: room.playing, time: getCurrentTime(room) });
    io.to(roomId).emit('room-users-update', { users: room.users, hostId: room.hostId });
  });

  // Video Sync Events (host only)
  socket.on('video-play', ({ roomId, time }) => {
    const room = getRoomIfHost(socket, roomId);
    if (!room) return;
    savePlayback(room, time, true);
    socket.to(roomId).emit('sync-play', room.time);
  });
  socket.on('video-pause', ({ roomId, time }) => {
    const room = getRoomIfHost(socket, roomId);
    if (!room) return;
    savePlayback(room, time, false);
    socket.to(roomId).emit('sync-pause', room.time);
  });
  socket.on('video-seek', ({ roomId, time }) => {
    const room = getRoomIfHost(socket, roomId);
    if (!room) return;
    savePlayback(room, time, room.playing);
    socket.to(roomId).emit('sync-seek', room.time);
  });
  socket.on('video-sync-heartbeat', ({ roomId, time, playing }) => {
    const room = getRoomIfHost(socket, roomId);
    if (!room) return;
    savePlayback(room, time, !!playing);
    socket.to(roomId).emit('sync-heartbeat', { time: room.time, playing: room.playing });
  });
  socket.on('change-url', ({ roomId, newUrl }) => {
    const room = getRoomIfHost(socket, roomId);
    if (!room || !isValidVideoUrl(newUrl)) return;
    room.videoUrl = newUrl;
    savePlayback(room, 0, false);
    io.to(roomId).emit('sync-url', newUrl);
  });

  // Chat & Interactions
  socket.on('send-chat', ({ roomId, text }) => {
    io.to(roomId).emit('receive-chat', { sender: socket.id.substring(0, 4), text });
  });
  socket.on('send-emoji', ({ roomId, emoji }) => io.to(roomId).emit('receive-emoji', emoji));

  // Poll Events
  socket.on('start-poll', ({ roomId, pollData }) => {
    io.to(roomId).emit('receive-poll', pollData);
  });
  socket.on('update-poll-state', ({ roomId, pollData }) => {
    io.to(roomId).emit('sync-poll-state', pollData);
  });

  // Host Transfer
  socket.on('transfer-host', ({ roomId, newHostId }) => {
    if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
      rooms[roomId].hostId = newHostId;
      io.to(roomId).emit('room-users-update', { users: rooms[roomId].users, hostId: rooms[roomId].hostId });
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(id => id !== socket.id);
      if (rooms[roomId].hostId === socket.id && rooms[roomId].users.length > 0) {
        rooms[roomId].hostId = rooms[roomId].users[0]; // Pass host to next user
      }
      io.to(roomId).emit('room-users-update', { users: rooms[roomId].users, hostId: rooms[roomId].hostId });
    }
  });
});

server.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
