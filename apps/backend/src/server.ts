import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import { setRideRequestSocket, setRideOfferSocket } from './controllers';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new SocketServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    setRideRequestSocket(io);
    setRideOfferSocket(io);

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-user-room', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      socket.on('leave-user-room', (userId: string) => {
        socket.leave(userId);
        console.log(`User ${userId} left their room`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/v1`);
      console.log(`WebSocket available at ws://localhost:${PORT}`);
      console.log(`Health check at http://localhost:${PORT}/health`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
