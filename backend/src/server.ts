import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT;

// If running in a serverless environment like Vercel, Vercel manages the HTTP server listeners.
// Otherwise, boot the server locally.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 GrowEasy CSV Importer Backend is running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   AI Provider:  ${env.AI_PROVIDER}`);
  });
}

export default app;
