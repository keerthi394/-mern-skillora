require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mentorRoutes = require('./routes/mentors');
const requestRoutes = require('./routes/requests');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const ratingRoutes = require('./routes/ratings');
const notificationRoutes = require('./routes/notifications');

const Message = require('./models/Message');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://mern-skillora.vercel.app',
];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed.`));
  },
  credentials: true,
}));

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('user:join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on('message:send', async (data) => {
    const { senderId, receiverId, message } = data;
    try {
      const conversationId = Message.getConversationId(senderId, receiverId);
      const msg = await Message.create({ conversationId, senderId, receiverId, message });
      const populated = await msg.populate('senderId', 'name profilePhoto');

      // Emit to receiver
      io.to(receiverId).emit('message:receive', populated);
      io.to(senderId).emit('message:receive', populated);

      // Notify receiver
      await Notification.create({
        userId: receiverId,
        type: 'new_message',
        message: `New message from ${populated.senderId.name}.`,
        link: '/messages',
      });
      io.to(receiverId).emit('notification:new');
    } catch (e) {
      socket.emit('message:error', 'Failed to send message.');
    }
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
  });
});

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MentorLink API is running 🚀',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ─── Connect & Start ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, { dbName: 'mentorlink' })
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MentorLink server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
