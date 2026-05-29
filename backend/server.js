const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

console.log('🔍 Environment Check:');
console.log('PORT:', process.env.PORT || 'Not loaded');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'URI is loaded ✓' : 'Not loaded ✗');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Uploads folder created');
}

// ============ ROUTES ============

app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to Property-Bazzar API',
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        databaseName: mongoose.connection.name || 'not connected',
        uptime: `${Math.floor(process.uptime())} seconds`
    });
});

app.use('/api/users/favorites', require('./routes/favoriteRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes')); // <-- NEW CHATBOT ROUTE

// ============ SOCKET.IO ============

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins with their ID
    socket.on('user-connect', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`👤 User ${userId} is online`);
        io.emit('user-online', userId);
    });

    // Join a chat room
    socket.on('join-chat', (conversationId) => {
        socket.join(conversationId);
        console.log(`💬 Joined chat: ${conversationId}`);
    });

    // Leave a chat room
    socket.on('leave-chat', (conversationId) => {
        socket.leave(conversationId);
    });

    // Send message
    socket.on('send-message', async (data) => {
        const { conversationId, message, senderId, receiverId } = data;
        
        // Emit to the conversation room
        io.to(conversationId).emit('new-message', {
            conversationId,
            message,
            senderId,
            createdAt: new Date()
        });

        // Send notification to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('message-notification', {
                conversationId,
                senderId,
                message: message.message?.substring(0, 50) + '...'
            });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { conversationId, userId } = data;
        socket.to(conversationId).emit('user-typing', { conversationId, userId });
    });

    socket.on('stop-typing', (data) => {
        const { conversationId, userId } = data;
        socket.to(conversationId).emit('user-stop-typing', { conversationId, userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user-offline', socket.userId);
        }
        console.log('🔌 User disconnected:', socket.id);
    });
});

// ============ ERROR HANDLING ============

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// ============ DATABASE & SERVER ============

console.log('🔄 Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
    .then((conn) => {
        console.log('✅ MongoDB Atlas Connected Successfully!');
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB Atlas Connection Failed!');
        console.error(`Error: ${error.message}`);
    });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('\n=================================');
    console.log(`🚀 Property-Bazzar API Server`);
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`💬 Socket.io ready for real-time chat`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=================================\n');
});