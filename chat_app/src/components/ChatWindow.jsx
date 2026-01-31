import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import { Done, DoneAll, Schedule, Error as ErrorIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/authContext';

const MessageStatus = ({ status, isSender }) => {
  if (!isSender) return null;

  const statusIcons = {
    pending: <Schedule sx={{ fontSize: 14, color: 'text.disabled' }} />,
    sent: <Done sx={{ fontSize: 14, color: 'text.disabled' }} />,
    delivered: <DoneAll sx={{ fontSize: 14, color: 'text.disabled' }} />,
    read: <DoneAll sx={{ fontSize: 14, color: '#667eea' }} />
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
      {statusIcons[status] || statusIcons.pending}
    </Box>
  );
};

const ChatWindow = ({ messages, selectedUser, isTyping }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (!selectedUser) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: '#f5f7fb'
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Welcome to Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a user to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7fb',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#bdbdbd',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#9e9e9e'
          }
        }}
      >
        {messages.map((message, index) => {
          const isSender = message.sender._id === user.id;
          const showDateSeparator = shouldShowDateSeparator(
            message,
            messages[index - 1]
          );

          return (
            <React.Fragment key={message._id}>
              {showDateSeparator && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <Chip
                    label={formatDateSeparator(message.createdAt)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: isSender ? 'flex-end' : 'flex-start',
                  mb: 1.5
                }}
              >
                {!isSender && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      bgcolor: 'grey.400',
                      fontSize: '0.875rem'
                    }}
                  >
                    {message.sender.username.charAt(0).toUpperCase()}
                  </Avatar>
                )}

                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    bgcolor: isSender ? '#667eea' : 'white',
                    color: isSender ? 'white' : 'text.primary',
                    borderRadius: isSender
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    wordBreak: 'break-word'
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {message.content}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 0.5
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: isSender ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                        fontSize: '0.7rem'
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </Typography>
                    <MessageStatus status={message.status} isSender={isSender} />
                  </Box>
                </Paper>
              </Box>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: 'grey.400',
                fontSize: '0.875rem'
              }}
            >
              {selectedUser.username.charAt(0).toUpperCase()}
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                bgcolor: 'white',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  '& span': {
                    width: 8,
                    height: 8,
                    bgcolor: 'grey.400',
                    borderRadius: '50%',
                    animation: 'typing 1.4s infinite',
                    '&:nth-of-type(2)': {
                      animationDelay: '0.2s'
                    },
                    '&:nth-of-type(3)': {
                      animationDelay: '0.4s'
                    }
                  },
                  '@keyframes typing': {
                    '0%, 60%, 100%': {
                      transform: 'translateY(0)'
                    },
                    '30%': {
                      transform: 'translateY(-10px)'
                    }
                  }
                }}
              >
                <span />
                <span />
                <span />
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};

export default ChatWindow;