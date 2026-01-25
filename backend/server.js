/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Main Server Entry Point - The Gateway to Adventure
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Welcome, brave developer, to the realm of CareerQuest!
 * Here begins your journey to slay the Final Boss: Unemployment.
 * 
 * May your code be bug-free and your servers ever responsive.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Import configurations
const config = require('./config');
const { connectDatabase, sequelize } = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questRoutes = require('./routes/questRoutes');
const bountyRoutes = require('./routes/bountyRoutes');
const oracleRoutes = require('./routes/oracleRoutes');
const barterRoutes = require('./routes/barterRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const bossBattleRoutes = require('./routes/bossBattleRoutes');
const chatRoutes = require('./routes/chatRoutes');
const guildRoutes = require('./routes/guildRoutes');
const friendRoutes = require('./routes/friendRoutes');
const cvRoutes = require('./routes/cvRoutes');

// Import Sequelize Models
const { Quest, Message, User } = require('./models');

// Initialize Express app
const app = express();
// const server = http.createServer(app); // Commented out to try app.listen

// Initialize Socket.io placeholder (will be initialized after server starts)
let io;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP - Equipping the Server with Armor
// ═══════════════════════════════════════════════════════════════════════════════

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (only in development)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Static files (for uploaded content)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES - The Quest Paths
// ═══════════════════════════════════════════════════════════════════════════════

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '⚔️ The server stands ready for battle!',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Welcome route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CareerQuest: The Apocalypse API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      quests: '/api/quests',
      bounties: '/api/bounties',
      oracle: '/api/oracle',
      barter: '/api/barter',
      mentorship: '/api/mentorship'
    }
  });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/bounties', bountyRoutes);
app.use('/api/oracle', oracleRoutes);
app.use('/api/barter', barterRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/boss-battles', bossBattleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/cv', cvRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `🗺️ The path '${req.originalUrl}' leads to nowhere... You are lost, adventurer!`
  });
});

// Global error handler
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER INITIALIZATION - Opening the Gates
// ═══════════════════════════════════════════════════════════════════════════════

// Make io available in routes (will be undefined until server starts)
app.use((req, res, next) => {
  req.io = io;
  next();
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Sync Database
    await sequelize.sync();

    // Start server
    const PORT = config.port;
    console.log('Attempting to start server on port:', PORT);

    const server = app.listen(PORT, () => {
      console.log('Server callback triggered');
      console.log(`
    ╔═══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                               ║
    ║     ⚔️  CAREERQUEST: THE APOCALYPSE  ⚔️                                      ║
    ║                                                                               ║
    ║     "Where job hunting meets fantasy adventure!"                              ║
    ║                                                                               ║
    ╠═══════════════════════════════════════════════════════════════════════════════╣
    ║                                                                               ║
    ║     🏰 Server Status: ONLINE                                                 ║
    ║     🌍 Environment: ${config.nodeEnv.toUpperCase().padEnd(54)}                ║
    ║     🚪 Port: ${String(PORT).padEnd(64)}                                       ║
    ║     🔗 URL: http://localhost:${String(PORT).padEnd(46)}                       ║
    ║                                                                               ║
    ║     📜 API Documentation: http://localhost:${PORT}/api                        ║
    ║                                                                               ║
    ╠═══════════════════════════════════════════════════════════════════════════════╣
    ║                                                                               ║
    ║     Ready to slay the Final Boss: UNEMPLOYMENT                                ║
    ║                                                                               ║
    ╚═══════════════════════════════════════════════════════════════════════════════╝
      `);
    });

    console.log('Server instance created');

    // Initialize Socket.io
    const { Server } = require("socket.io");

    console.log('Initializing Socket.io');
    io = new Server(server, {
      cors: {
        origin: config.clientUrl,
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    console.log('Socket.io initialized');

    // Socket.io logic
    let onlineUsers = 0;

    io.on('connection', async (socket) => {
      onlineUsers++;
      io.emit('onlineUsersUpdate', onlineUsers);
      console.log(`User connected. Total online: ${onlineUsers}`);

      // Emit current quest count to the new user
      try {
        const count = await Quest.count({ where: { isActive: true } });
        socket.emit('questCountUpdate', count);
      } catch (err) {
        console.error('Error fetching quest count for socket:', err);
      }

      // Join Chat Room
      socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });

      // Handle Chat Message
      socket.on('chatMessage', async (data) => {
        try {
          const { sender, content, room } = data;

          // Save to database
          const newMessage = await Message.create({
            senderId: sender,
            content,
            room
          });

          // Populate sender info manually since we're using Sequelize
          const messageWithSender = await Message.findByPk(newMessage.id, {
            include: [{
              model: User,
              as: 'sender',
              attributes: ['heroName', 'avatar', 'heroClass', 'level']
            }]
          });

          // Broadcast to room
          io.to(room).emit('message', messageWithSender);
        } catch (err) {
          console.error('Error handling chat message:', err);
        }
      });

      socket.on('disconnect', () => {
        onlineUsers = Math.max(0, onlineUsers - 1);
        io.emit('onlineUsersUpdate', onlineUsers);
        console.log(`User disconnected. Total online: ${onlineUsers}`);
      });
    });

  } catch (error) {
    console.error('💀 Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💀 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('💀 UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app; // For testing purposes
