import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Send, EmojiEmotions } from '@mui/icons-material';

const MessageInput = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Emit typing start
    if (!isTypingRef.current) {
      onTyping(true);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      isTypingRef.current = false;
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping(false);
      isTypingRef.current = false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? 'Select a user to start chatting' : 'Type a message...'}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            bgcolor: '#f5f7fb',
            '& fieldset': {
              borderColor: 'transparent'
            },
            '&:hover fieldset': {
              borderColor: 'primary.main'
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main'
            }
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="submit"
                color="primary"
                disabled={!message.trim() || disabled}
                sx={{
                  bgcolor: message.trim() && !disabled ? 'primary.main' : 'transparent',
                  color: message.trim() && !disabled ? 'white' : 'action.disabled',
                  '&:hover': {
                    bgcolor: message.trim() && !disabled ? 'primary.dark' : 'transparent'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Send />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
};

export default MessageInput;