import { Router } from 'express';
import { handleUpload } from '../middleware/upload.middleware';
import { validateConfirmImport } from '../validators/import.validator';
import { previewCsv, confirmImport } from '../controllers/import.controller';

const importRouter = Router();

// POST /api/import/preview — Upload CSV, parse, return preview (no AI)
importRouter.post('/preview', handleUpload, previewCsv);

// POST /api/import/confirm — Validate body, then send records to AI for CRM extraction
importRouter.post('/confirm', validateConfirmImport, confirmImport);

export { importRouter };
