require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/user');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Store online users
const onlineUsers = new Map();

// Helper function to generate conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login
  socket.on('user:login', async (userId) => {
    try {
      onlineUsers.set(userId, socket.id);
      
      // Update user status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Broadcast online status to all users
      io.emit('user:status', {
        userId,
        isOnline: true
      });

      console.log(`User ${userId} is now online`);
    } catch (error) {
      console.error('Error in user:login:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing:start', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:display', {
        userId: senderId,
        isTyping: true
      });
    }
  });

  socket.on('typing:stop', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:display', {
        userId: senderId,
        isTyping: false
      });
    }
  });

  // Handle sending messages
  socket.on('message:send', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const conversationId = getConversationId(senderId, receiverId);

      // Create message
      const message = new Message({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        content,
        status: 'sent'
      });

      await message.save();
      await message.populate('sender', 'username avatar');
      await message.populate('receiver', 'username avatar');

      socket.emit('message:received', message);

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        message.status = 'delivered';
        await message.save();
        
        io.to(receiverSocketId).emit('message:new', message);
        
        socket.emit('message:delivered', {
          messageId: message._id,
          status: 'delivered'
        });
      }
    } catch (error) {
      console.error('Error in message:send:', error);
      socket.emit('message:error', { error: error.message });
    }
  });

  socket.on('message:read', async ({ messageIds, userId, otherUserId }) => {
    try {
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          receiver: userId
        },
        {
          status: 'read',
          readAt: new Date()
        }
      );

      const senderSocketId = onlineUsers.get(otherUserId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read:confirmation', {
          messageIds,
          readAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error in message:read:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    let disconnectedUserId;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      try {
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastSeen: new Date()
        });

        io.emit('user:status', {
          userId: disconnectedUserId,
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});