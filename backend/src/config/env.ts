import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  FRONTEND_URL: string;
  AI_PROVIDER: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  AI_BATCH_SIZE: number;
  MAX_FILE_SIZE_MB: number;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  AI_BATCH_SIZE: parseInt(process.env.AI_BATCH_SIZE || '25', 10),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};
