// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Simple ID generator to avoid ESM/CJS issues with nanoid
const nanoid = (size = 10) => {
  const chars = '1234567890abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const app = express();
app.use(cors());

// Trust proxy for Vercel/Railway
app.set('trust proxy', 1);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (_req, res) => res.status(200).send('ok'));

// Serve index.html for all other routes (SPA support)
app.get(/^(?!\/socket.io).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global state
let rooms = new Map();
let lastMsgAt = new Map();
const RATE_MS = 600;

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), messages: [] });
  }
  return rooms.get(roomId);
}

// Initialize global room
getRoom('global');

// Create HTTP server
const server = http.createServer(app);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'], // Allow both, Vercel will force polling if needed via client
  allowEIO3: true,
  pingTimeout: 60000,
});

// Socket.IO Logic
io.on('connection', (socket) => {
  // Initial setup
  socket.data.name = `user-${nanoid()}`;
  socket.data.room = null;

  // Send room list
  socket.emit('rooms:list', Array.from(rooms.keys()));

  socket.on('join', ({ roomId = 'global', name }) => {
    const sanitizedRoomId = (roomId || 'global').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 50) || 'global';

    // Leave previous room
    if (socket.data.room) {
      socket.leave(socket.data.room);
      const prevRoom = getRoom(socket.data.room);
      if (prevRoom) {
        prevRoom.users.delete(socket.id);
        io.to(socket.data.room).emit('presence:update', Array.from(prevRoom.users.values()));
      }
    }

    // Join new room
    socket.data.room = sanitizedRoomId;
    if (name) socket.data.name = name.trim().slice(0, 32);

    socket.join(sanitizedRoomId);
    const room = getRoom(sanitizedRoomId);
    room.users.set(socket.id, { name: socket.data.name });

    // Notify room
    io.to(sanitizedRoomId).emit('system', {
      id: nanoid(),
      user: { name: 'system' },
      text: `${socket.data.name} joined`,
      ts: Date.now(),
      roomId: sanitizedRoomId
    });

    io.to(sanitizedRoomId).emit('presence:update', Array.from(room.users.values()));
    socket.emit('history', room.messages.slice(-50));
    io.emit('rooms:list', Array.from(rooms.keys()));
  });

  socket.on('message', (raw) => {
    const now = Date.now();
    const last = lastMsgAt.get(socket.id) || 0;
    if (now - last < RATE_MS) return;
    lastMsgAt.set(socket.id, now);

    const roomId = socket.data.room;
    if (!roomId) return;

    const room = getRoom(roomId);
    let text = (raw?.text || '').slice(0, 2000);
    let image = null;

    if (raw?.image?.startsWith('data:image/') && raw.image.length < 7000000) {
      image = raw.image;
    }

    if (!text.trim() && !image) return;

    const msg = {
      id: nanoid(),
      user: { name: socket.data.name },
      text: text || null,
      image: image,
      ts: Date.now(),
      roomId
    };

    room.messages.push(msg);
    if (room.messages.length > 100) room.messages.shift();

    io.to(roomId).emit('message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.data.room) {
      const room = getRoom(socket.data.room);
      if (room) {
        room.users.delete(socket.id);
        io.to(socket.data.room).emit('presence:update', Array.from(room.users.values()));
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
  // Vercel Serverless Function Export
  module.exports = (req, res) => {
    server.emit('request', req, res);
  };
} else {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
