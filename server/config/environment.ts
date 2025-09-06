import joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define validation schema
const envSchema = joi.object({
  // Required in production
  NODE_ENV: joi.string()
    .valid('development', 'production', 'staging', 'test')
    .default('development'),
  
  // Database
  DATABASE_URL: joi.string().when('NODE_ENV', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.optional()
  }),
  
  // Autodesk Platform Services
  APS_CLIENT_ID: joi.string().when('NODE_ENV', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.optional()
  }),
  APS_CLIENT_SECRET: joi.string().when('NODE_ENV', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.optional()
  }),
  
  // Server
  PORT: joi.number().default(5000),
  LOG_LEVEL: joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  
  // Security
  SESSION_SECRET: joi.string().min(32).when('NODE_ENV', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.default('dev-secret-change-in-production')
  }),
  CORS_ORIGIN: joi.string().default('http://localhost:5000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: joi.number().default(100),
  
  // File Upload
  MAX_UPLOAD_SIZE: joi.number().default(52428800), // 50MB
  UPLOAD_TEMP_DIR: joi.string().default('/tmp/uploads'),
  
  // Optional services
  OPENAI_API_KEY: joi.string().optional(),
  ANTHROPIC_API_KEY: joi.string().optional(),
  REDIS_URL: joi.string().optional(),
  SENTRY_DSN: joi.string().optional(),
  
  // Feature flags
  ENABLE_AI: joi.boolean().default(true),
  ENABLE_COLLABORATION: joi.boolean().default(true),
  STORAGE_TYPE: joi.string().valid('memory', 'postgres').default('postgres')
}).unknown(); // Allow other env vars

// Validate environment
const { error, value: env } = envSchema.validate(process.env);

if (error) {
  console.error('❌ Environment validation failed:');
  console.error(error.details.map(d => `  - ${d.message}`).join('\n'));
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing in development mode despite validation errors');
  }
}

// Export typed configuration
export const config = {
  // Environment
  nodeEnv: env.NODE_ENV as 'development' | 'production' | 'staging' | 'test',
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  
  // Server
  port: env.PORT as number,
  logLevel: env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug',
  
  // Database
  databaseUrl: env.DATABASE_URL as string | undefined,
  
  // APS
  aps: {
    clientId: env.APS_CLIENT_ID as string | undefined,
    clientSecret: env.APS_CLIENT_SECRET as string | undefined,
  },
  
  // Security
  sessionSecret: env.SESSION_SECRET as string,
  corsOrigin: env.CORS_ORIGIN as string,
  
  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS as number,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS as number,
  },
  
  // File Upload
  upload: {
    maxSize: env.MAX_UPLOAD_SIZE as number,
    tempDir: env.UPLOAD_TEMP_DIR as string,
  },
  
  // External Services
  openaiApiKey: env.OPENAI_API_KEY as string | undefined,
  anthropicApiKey: env.ANTHROPIC_API_KEY as string | undefined,
  redisUrl: env.REDIS_URL as string | undefined,
  sentryDsn: env.SENTRY_DSN as string | undefined,
  
  // Features
  features: {
    ai: env.ENABLE_AI as boolean,
    collaboration: env.ENABLE_COLLABORATION as boolean,
  },
  
  // Storage
  storageType: env.STORAGE_TYPE as 'memory' | 'postgres',
};

// Log configuration (sanitized)
if (config.isDevelopment) {
  console.log('📋 Configuration loaded:');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.databaseUrl ? 'Configured' : 'Not configured'}`);
  console.log(`   APS: ${config.aps.clientId ? 'Configured' : 'Not configured'}`);
  console.log(`   Features: AI=${config.features.ai}, Collaboration=${config.features.collaboration}`);
}