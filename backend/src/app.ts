import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import workflowRoutes from './modules/workflows/workflow.routes';
import { sendError } from './utils/response';

import { createServer } from 'http';
import { initializeSocket } from './config/socket';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

import authRoutes from './modules/auth/auth.routes';
import executionRoutes from './modules/executions/execution.routes';
import webhookRoutes from './modules/webhooks/webhook.routes';
import workspaceRoutes from './modules/workspaces/workspace.routes';
import './workers/workflow.worker'; // Initialize the main worker
import './workers/cron.worker'; // Initialize the cron worker

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  sendError(res, err.message || 'Internal Server Error', err.status || 500);
});

// Triggering restart 4
// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
