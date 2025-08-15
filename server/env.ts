import { config } from 'dotenv-safe';

config();

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
};

export const DATABASE_URL = requireEnv('DATABASE_URL');
export const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
export const ANTHROPIC_API_KEY = requireEnv('ANTHROPIC_API_KEY');

export const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || '';
export const PGUSER = process.env.PGUSER || '';
export const PGPASSWORD = process.env.PGPASSWORD || '';
export const PGDATABASE = process.env.PGDATABASE || '';
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
