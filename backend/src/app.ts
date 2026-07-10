import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { healthRouter } from './routes/health.routes';
import { importRouter } from './routes/import.routes';
import { leadRouter } from './routes/lead.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security middleware — configured for API-only server
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// CORS — Allow dynamic request origin reflection to support multi-environment testing
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Request logger
app.use(pinoHttp({
  transport: {
    target: 'pino/file',
    options: { destination: 1 }, // stdout
  },
  autoLogging: {
    ignore: (req) => (req as express.Request).path === '/health',
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/', healthRouter);
app.use('/api/import', importRouter);
app.use('/api/leads', leadRouter);


// 404 handler for unknown routes
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

export { app };
