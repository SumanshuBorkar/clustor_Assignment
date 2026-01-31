import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Logout, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUsers, getMessages } from '../services/api';
import socketService from '../services/socket';
import UserList from './userList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""'
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0
    }
  }
}));

const Chat = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadUsers();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
      markMessagesAsRead();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await getMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = useCallback(() => {
    if (!selectedUser || !user) return;

    const unreadMessages = messages
      .filter(msg => msg.receiver._id === user.id && msg.status !== 'read')
      .map(msg => msg._id);

    if (unreadMessages.length > 0) {
      socketService.markAsRead(unreadMessages, user.id, selectedUser._id);
    }
  }, [selectedUser, messages, user]);

  const setupSocketListeners = () => {
    // User status updates
    socketService.on('user:status', ({ userId, isOnline, lastSeen }) => {
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === userId ? { ...u, isOnline, lastSeen } : u
        )
      );

      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, isOnline, lastSeen }));
      }
    });

    // Typing indicators
    socketService.on('typing:display', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));

      // Auto-clear typing indicator after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: false
          }));
        }, 3000);
      }
    });

    // New messages
    socketService.on('message:new', (message) => {
      if (
        selectedUser &&
        (message.sender._id === selectedUser._id ||
          message.receiver._id === selectedUser._id)
      ) {
        setMessages(prev => [...prev, message]);

        // Mark as read if chat is open
        if (message.receiver._id === user.id) {
          setTimeout(() => {
            socketService.markAsRead([message._id], user.id, selectedUser._id);
          }, 500);
        }
      }
    });

    // Message received confirmation
    socketService.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Message delivered
    socketService.on('message:delivered', ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    // Message read confirmation
    socketService.on('message:read:confirmation', ({ messageIds, readAt }) => {
      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg._id)
            ? { ...msg, status: 'read', readAt }
            : msg
        )
      );
    });
  };

  const cleanupSocketListeners = () => {
    socketService.off('user:status');
    socketService.off('typing:display');
    socketService.off('message:new');
    socketService.off('message:received');
    socketService.off('message:delivered');
    socketService.off('message:read:confirmation');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setTypingUsers(prev => ({ ...prev, [user._id]: false }));
  };

  const handleSendMessage = (content) => {
    if (!selectedUser || !user) return;

    socketService.sendMessage({
      senderId: user.id,
      receiverId: selectedUser._id,
      content
    });
  };

  const handleTyping = (isTyping) => {
    if (!selectedUser || !user) return;

    if (isTyping) {
      socketService.startTyping(user.id, selectedUser._id);
    } else {
      socketService.stopTyping(user.id, selectedUser._id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#f5f7fb' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '20vw',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#667eea' }}>
          <Toolbar>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </StyledBadge>
            <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
              {user?.username}
            </Typography>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            CONTACTS
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <UserList
            users={users}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            currentUserId={user?.id}
            typingUsers={typingUsers}
          />
        </Box>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow:'scroll' }}>
        {selectedUser && (
          <AppBar position="static" elevation={1} sx={{ bgcolor: 'white' }}>
            <Toolbar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1" color="text.primary" fontWeight={600}>
                  {selectedUser.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {typingUsers[selectedUser._id]
                    ? 'typing...'
                    : selectedUser.isOnline
                    ? 'Online'
                    : 'Offline'}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatWindow
            messages={messages}
            selectedUser={selectedUser}
            isTyping={typingUsers[selectedUser?._id]}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!selectedUser}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;