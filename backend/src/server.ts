import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initWebSocketServer } from './services/websocket.service';
import { createImportWorker } from './workers/import.worker';

const PORT = env.PORT;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// If running in a serverless environment like Vercel, Vercel manages the HTTP server listeners.
// Otherwise, boot the server locally.
if (!process.env.VERCEL) {
  // Start the BullMQ background worker
  createImportWorker();

  // Attach WebSocket server for real-time progress events
  initWebSocketServer(server);

  server.listen(PORT, () => {
    console.log(`🚀 GrowEasy CSV Importer Backend is running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   AI Provider:  ${env.AI_PROVIDER}`);
  });
}

export default app;
