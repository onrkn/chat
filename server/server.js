import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();
const users = new Map();

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, userId, username }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const user = {
      id: userId,
      username,
      balance: 100,
      roomId
    };
    
    users.set(userId, user);
    rooms.get(roomId).add(userId);
    
    const roomUsers = Array.from(rooms.get(roomId))
      .map(id => users.get(id))
      .filter(Boolean);
    
    io.to(roomId).emit('users_update', roomUsers);
  });

  socket.on('leave_room', ({ roomId, userId }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      users.delete(userId);
      socket.leave(roomId);
      io.to(roomId).emit('user_left', userId);
    }
  });

  socket.on('message', (message) => {
    io.to(message.roomId).emit('message', {
      ...message,
      id: Date.now().toString()
    });
  });

  socket.on('play_game', ({ roomId, userId, bet }, callback) => {
    const user = users.get(userId);
    if (!user || user.balance < bet) {
      callback({ error: 'Insufficient balance' });
      return;
    }

    const won = Math.random() >= 0.5;
    user.balance += won ? bet : -bet;
    
    const roomUsers = Array.from(rooms.get(roomId))
      .map(id => users.get(id))
      .filter(Boolean);
    
    io.to(roomId).emit('users_update', roomUsers);
    callback({ won, newBalance: user.balance });
  });

  socket.on('disconnect', () => {
    for (const [roomId, userIds] of rooms.entries()) {
      for (const userId of userIds) {
        if (users.get(userId)?.socket === socket.id) {
          userIds.delete(userId);
          users.delete(userId);
          io.to(roomId).emit('user_left', userId);
          break;
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});