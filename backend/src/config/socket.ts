import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust this for prduction
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Clients can join a room to listen for specific workflow executions
    socket.on('join:execution', (executionId: string) => {
      console.log(`[Socket.io] Client ${socket.id} joined room: ${executionId}`);
      socket.join(executionId);
    });

    socket.on('join:workflow', (workflowId: string) => {
      console.log(`[Socket.io] Client ${socket.id} joined room: workflow-${workflowId}`);
      socket.join(`workflow-${workflowId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.io] Initialized successfully');
};
