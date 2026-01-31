# MERN Chat App - Quick Start Guide

A real-time chat application with online status, typing indicators, and read receipts.

##  Quick Setup (5 Minutes)

### Prerequisites
- Node.js (v14+)
- MongoDB running locally OR MongoDB Atlas account

---

##  Installation

### 1️⃣ Setup Backend

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_secret_key_change_this
CLIENT_URL=http://localhost:3000
```

**Start backend server:**
```bash
npm run dev
```

 You should see: `Server running on port 5000` and `MongoDB connected`

---

### 2️⃣ Setup Frontend

**Open a NEW terminal window**

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start React app
npm start
```

✅ Browser opens automatically at `http://localhost:3000`

---

##  Usage

1. **Create Account**: Click "Sign Up" and register
2. **Open Incognito/Another Browser**: Create a second account
3. **Start Chatting**: Click on a user from the sidebar to chat!

---

## 🔧 Troubleshooting

**MongoDB Connection Error?**
```bash
# Start MongoDB service
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Port Already in Use?**
```bash
# Change PORT in server/.env to 5001
# Or kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

**Module Not Found?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

##  Test the Features

### ✅ Online Status
- Create 2 accounts → See green dot for online users

### ✅ Typing Indicator  
- Start typing → Other user sees "typing..."

### ✅ Read Receipts
- Send message → Watch status change: ⏱️ → ✓ → ✓✓ → ✓✓(blue)

### ✅ Real-time Messaging
- Send from one account → Instantly appears on other

---

##  MongoDB Atlas (Cloud Database)

**If you don't have local MongoDB:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/chat-app
```

---

##  Project Structure

```
mern-chat-app/
├── server/          # Backend (Node.js + Express + Socket.io)
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   └── server.js    # Main server file
│
└── client/          # Frontend (React + Material-UI)
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Main pages
    │   └── services/     # API & Socket services
    └── public/
```

---

##  Features

✨ Real-time messaging with Socket.io  
✨ Online/Offline status tracking  
✨ Typing indicators  
✨ Read receipts (Pending → Sent → Delivered → Read)  
✨ Beautiful Material-UI interface  
✨ JWT authentication  
✨ Responsive design  

---

##  Full Documentation

- **INSTALLATION.md** - Detailed setup instructions
- **API.md** - Complete API reference
- **README.md** - Full project documentation

---

##  Need Help?

**Backend not connecting?**
- Check MongoDB is running
- Verify `.env` file exists with correct values

**Frontend errors?**
- Ensure backend is running first on port 5000
- Check browser console for errors (F12)

**Can't chat between users?**
- Both users must be registered
- Click on user in sidebar to open chat
- Ensure both frontend and backend are running

---

##  Quick Commands Reference

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm start
```

**That's it! Happy chatting! 💬**
