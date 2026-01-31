import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // User authentication
  login(userId) {
    this.emit('user:login', userId);
  }

  // Typing indicators
  startTyping(senderId, receiverId) {
    this.emit('typing:start', { senderId, receiverId });
  }

  stopTyping(senderId, receiverId) {
    this.emit('typing:stop', { senderId, receiverId });
  }

  // Messages
  sendMessage(messageData) {
    this.emit('message:send', messageData);
  }

  markAsRead(messageIds, userId, otherUserId) {
    this.emit('message:read', { messageIds, userId, otherUserId });
  }
}

export default new SocketService();