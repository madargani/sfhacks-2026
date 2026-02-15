import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';

dotenv.config();

const app = express();

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN;
const hasWildcardOrigin = corsOrigin?.trim() === '*';

app.use(
  cors({
    origin: corsOrigin
      ? hasWildcardOrigin
        ? (origin, callback) => callback(null, origin ?? true)
        : corsOrigin.split(',').map((origin) => origin.trim())
      : (origin, callback) => callback(null, origin ?? true),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1', routes);

app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  const isDbConnected = dbState === 1;
  
  res.json({ 
    status: isDbConnected ? 'ok' : 'error', 
    database: dbStatus[dbState as keyof typeof dbStatus],
    timestamp: new Date().toISOString() 
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
