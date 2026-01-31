import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'online' ? '#44b700' : '#bdbdbd',
    color: status === 'online' ? '#44b700' : '#bdbdbd',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
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

const UserList = ({ users, selectedUser, onUserSelect, currentUserId, typingUsers }) => {
  const getLastSeenText = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {users.map((user, index) => {
        const isSelected = selectedUser?._id === user._id;
        const isTyping = typingUsers[user._id];

        return (
          <React.Fragment key={user._id}>
            <ListItem
              button
              selected={isSelected}
              onClick={() => onUserSelect(user)}
              sx={{
                py: 2,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(103, 126, 234, 0.08)',
                  borderLeft: '4px solid #667eea',
                  '&:hover': {
                    backgroundColor: 'rgba(103, 126, 234, 0.12)'
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemAvatar>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  status={user.isOnline ? 'online' : 'offline'}
                >
                  <Avatar
                    sx={{
                      bgcolor: user.isOnline ? 'primary.main' : 'grey.400',
                      width: 50,
                      height: 50,
                      fontSize: '1.2rem'
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight={isSelected ? 600 : 500}
                    sx={{ color: isSelected ? 'primary.main' : 'text.primary' }}
                  >
                    {user.username}
                  </Typography>
                }
                secondary={
                  <Box>
                    {isTyping ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontStyle: 'italic',
                          fontWeight: 500
                        }}
                      >
                        typing...
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {user.isOnline ? 'Online' : `Last seen ${getLastSeenText(user.lastSeen)}`}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < users.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default UserList;