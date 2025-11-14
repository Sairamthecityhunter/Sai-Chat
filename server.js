// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const path = require('path');

const app = express();
app.use(cors());

// Trust proxy for Railway (important for HTTPS)
app.set('trust proxy', 1);

// Optional health check
app.get('/health', (_req, res) => res.send('ok'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all other routes (SPA support) - must be last
app.use((req, res) => {
  // Don't serve index.html for socket.io or other API routes
  if (req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory room store
const rooms = new Map(); // roomId => { users: Map(socketId=>{name}), messages: Array }

// Initialize global room on startup
getRoom('global');

// Simple profanity filter (replace bad-words with a simple function)
function filterBadWords(text) {
  // Simple word filter - you can extend this list
  const badWords = ['badword1', 'badword2']; // Add words as needed
  let filtered = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), messages: [] });
  }
  return rooms.get(roomId);
}

// Simple per-socket rate limit (1 msg / 600ms)
const RATE_MS = 600;
const lastMsgAt = new Map();

io.on('connection', (socket) => {
  // defaults
  socket.data.name = `user-${nanoid()}`;
  socket.data.room = null; // Don't auto-join, wait for client to specify

  // Ensure global room exists and send current room list to new connection
  getRoom('global'); // Make sure global always exists
  socket.emit('rooms:list', Array.from(rooms.keys()));

  // join a room / set name
  socket.on('join', ({ roomId = 'global', name }) => {
    // Sanitize room ID (alphanumeric, hyphens, underscores only, max 50 chars)
    let sanitizedRoomId = 'global';
    if (roomId && typeof roomId === 'string') {
      const sanitized = roomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 50);
      if (sanitized && sanitized.length > 0) {
        sanitizedRoomId = sanitized;
      }
    }
    
    // leave previous room
    const prevRoom = socket.data.room;
    if (prevRoom && rooms.has(prevRoom)) {
      const r = getRoom(prevRoom);
      r.users.delete(socket.id);
      io.to(prevRoom).emit('presence:update', Array.from(r.users.values()));
      socket.leave(prevRoom);
    }

    socket.data.room = sanitizedRoomId;
    if (name && typeof name === 'string') {
      socket.data.name = name.trim().slice(0, 32);
    }

    socket.join(sanitizedRoomId);
    const r2 = getRoom(sanitizedRoomId);
    r2.users.set(socket.id, { name: socket.data.name });

    io.to(sanitizedRoomId).emit('system', {
      id: nanoid(),
      user: { name: 'system' },
      text: `${socket.data.name} joined ${sanitizedRoomId}`,
      ts: Date.now(),
      roomId: sanitizedRoomId
    });

    io.to(sanitizedRoomId).emit('presence:update', Array.from(r2.users.values()));
    socket.emit('history', r2.messages.slice(-100));
    
    // Broadcast updated room list to all clients
    io.emit('rooms:list', Array.from(rooms.keys()));
  });
  
  // Handle room creation request
  socket.on('room:create', ({ roomId }) => {
    if (!roomId || typeof roomId !== 'string') return;
    
    // Sanitize room ID (alphanumeric, hyphens, underscores only, max 50 chars)
    const sanitized = roomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 50);
    if (!sanitized || sanitized.length < 1) return;
    
    // Create room if it doesn't exist
    getRoom(sanitized);
    
    // Broadcast updated room list to all clients
    io.emit('rooms:list', Array.from(rooms.keys()));
    
    // Auto-join the newly created room (trigger join handler)
    const prevRoom = socket.data.room;
    if (prevRoom && rooms.has(prevRoom)) {
      const r = getRoom(prevRoom);
      r.users.delete(socket.id);
      io.to(prevRoom).emit('presence:update', Array.from(r.users.values()));
      socket.leave(prevRoom);
    }

    socket.data.room = sanitized;
    socket.join(sanitized);
    const r2 = getRoom(sanitized);
    r2.users.set(socket.id, { name: socket.data.name });

    io.to(sanitized).emit('system', {
      id: nanoid(),
      user: { name: 'system' },
      text: `${socket.data.name} joined ${sanitized}`,
      ts: Date.now(),
      roomId: sanitized
    });

    io.to(sanitized).emit('presence:update', Array.from(r2.users.values()));
    socket.emit('history', r2.messages.slice(-100));
  });

  socket.on('typing', (isTyping) => {
    const roomId = socket.data.room;
    socket.to(roomId).emit('typing', { name: socket.data.name, isTyping: !!isTyping });
  });

  socket.on('message', (raw) => {
    const now = Date.now();
    const last = lastMsgAt.get(socket.id) || 0;
    if (now - last < RATE_MS) return; // rate limit
    lastMsgAt.set(socket.id, now);

    const roomId = socket.data.room;
    const r = getRoom(roomId);

    let text = (raw && raw.text ? String(raw.text) : '').slice(0, 2000);
    text = filterBadWords(text);
    if (!text.trim()) return;

    const msg = {
      id: nanoid(),
      user: { name: socket.data.name },
      text,
      ts: Date.now(),
      roomId
    };

    r.messages.push(msg);
    if (r.messages.length > 500) r.messages.shift();

    io.to(roomId).emit('message', msg);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.room;
    const r = getRoom(roomId);
    r.users.delete(socket.id);
    io.to(roomId).emit('presence:update', Array.from(r.users.values()));
  });
});

// Cleanup function to delete messages older than 24 hours
function cleanupOldMessages() {
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  rooms.forEach((room, roomId) => {
    const initialLength = room.messages.length;
    // Filter out messages older than 24 hours
    room.messages = room.messages.filter(msg => {
      return (now - msg.ts) < TWENTY_FOUR_HOURS;
    });
    
    const removedCount = initialLength - room.messages.length;
    if (removedCount > 0) {
      console.log(`[Cleanup] Removed ${removedCount} old message(s) from room: ${roomId}`);
    }
  });
}

// Run cleanup every hour
setInterval(cleanupOldMessages, 60 * 60 * 1000); // 1 hour in milliseconds

// Also run cleanup on startup to clean any old messages
cleanupOldMessages();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  const protocol = process.env.RAILWAY_ENVIRONMENT ? 'https' : 'http';
  const hostname = process.env.RAILWAY_PUBLIC_DOMAIN || HOST;
  console.log(`✓ Chat server running on ${protocol}://${hostname}:${PORT}`);
  console.log(`✓ Server is ready to accept connections`);
});
