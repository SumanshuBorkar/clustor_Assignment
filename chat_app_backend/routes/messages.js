const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../services/auth');

// Helper function to generate conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

// Get messages between two users
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const conversationId = getConversationId(req.user._id.toString(), receiverId);
    
    const message = new Message({
      conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
      status: 'sent'
    });
    
    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/read/:userId', authMiddleware, async (req, res) => {
  try {
    const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
    
    await Message.updateMany(
      {
        conversationId,
        receiver: req.user._id,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;