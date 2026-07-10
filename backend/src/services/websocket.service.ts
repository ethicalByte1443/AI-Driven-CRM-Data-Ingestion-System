import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { QueueEvents } from 'bullmq';
import { redisConfig } from '../config/redis.connection';
import { IMPORT_QUEUE_NAME } from '../queues/import.queue';

// Map of jobId -> Set of connected WebSockets subscribed to it
const subscriptions = new Map<string, Set<WebSocket>>();

export function initWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  // Bind WebSocket server upgrade to Express HTTP server
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // Setup QueueEvents to listen to BullMQ job updates
  const queueEvents = new QueueEvents(IMPORT_QUEUE_NAME, { connection: redisConfig });

  queueEvents.on('progress', ({ jobId, data }) => {
    console.log(`[WS] Queue progress event for job ${jobId}:`, data);
    broadcastToJob(jobId, {
      event: 'progress',
      jobId,
      data, // ProgressData containing percentage, currentBatch, etc.
    });
  });

  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`[WS] Queue completed event for job ${jobId}`);
    broadcastToJob(jobId, {
      event: 'completed',
      jobId,
      result: returnvalue,
    });
    // Clean up subscriptions for this completed job
    subscriptions.delete(jobId);
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[WS] Queue failed event for job ${jobId}: ${failedReason}`);
    broadcastToJob(jobId, {
      event: 'failed',
      jobId,
      error: failedReason || 'Job failed processing',
    });
    // Clean up subscriptions for this failed job
    subscriptions.delete(jobId);
  });

  // Handle new WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] New client connected');

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        const { type, jobId } = parsed;

        if (type === 'subscribe' && jobId) {
          console.log(`[WS] Client subscribing to job: ${jobId}`);
          
          if (!subscriptions.has(jobId)) {
            subscriptions.set(jobId, new Set());
          }
          subscriptions.get(jobId)!.add(ws);

          // Confirm subscription
          ws.send(JSON.stringify({ event: 'subscribed', jobId }));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
        ws.send(JSON.stringify({ event: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      // Clean up connection from all subscriptions
      for (const [jobId, clients] of subscriptions.entries()) {
        if (clients.has(ws)) {
          clients.delete(ws);
          if (clients.size === 0) {
            subscriptions.delete(jobId);
          }
        }
      }
    });
  });

  console.log('[WS] WebSocket Server initialized and attached');
}

/**
 * Send a message to all WebSockets subscribed to a specific jobId
 */
function broadcastToJob(jobId: string, message: any) {
  const clients = subscriptions.get(jobId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
