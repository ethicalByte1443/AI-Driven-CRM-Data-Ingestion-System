import { Router, Request, Response } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'GrowEasy CSV Importer Backend is running',
  });
});

export { healthRouter };
