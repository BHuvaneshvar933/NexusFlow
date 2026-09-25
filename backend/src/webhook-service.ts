import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import webhookRoutes from './modules/webhooks/webhook.routes';
import { sendError } from './utils/response';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001; // Running on 3001 to avoid conflict with main API

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: (origin, callback) => {
    callback(null, true);
  }, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());

// ⚡️ ONLY mount webhook routes
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'webhook-ingestion', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found in Webhook service' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  sendError(res, err.message || 'Internal Server Error', err.status || 500);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook Ingestion Service running on http://localhost:${PORT}`);
});

export default app;
