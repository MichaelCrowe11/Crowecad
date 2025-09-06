import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from '../config/environment';
import { logger } from '../config/logger';
import type { Express, Request, Response, NextFunction } from 'express';

// Rate limiter configurations
export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimit.windowMs,
    max: max || config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path
      });
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((windowMs || config.rateLimit.windowMs) / 1000)
      });
    }
  });
};

// API-specific rate limiters
export const apiLimiter = createRateLimiter();
export const authLimiter = createRateLimiter(900000, 5); // 5 attempts per 15 min
export const uploadLimiter = createRateLimiter(3600000, 10); // 10 uploads per hour

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, validate against whitelist
    if (config.isProduction) {
      const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Helmet security headers configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://developer.api.autodesk.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://developer.api.autodesk.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://developer.api.autodesk.com", "https://api.openai.com"],
      frameSrc: ["'self'", "https://developer.api.autodesk.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Required for Autodesk Viewer
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Apply security middleware to Express app
export const applySecurityMiddleware = (app: Express) => {
  // Compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6 // Balance between speed and compression
  }));
  
  // Security headers
  app.use(helmet(helmetConfig));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Trust proxy (for accurate IP addresses behind reverse proxies)
  if (config.isProduction) {
    app.set('trust proxy', 1);
  }
  
  // Global rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/aps/upload', uploadLimiter);
  
  // Prevent parameter pollution
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Clean up query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (Array.isArray(req.query[key])) {
          req.query[key] = (req.query[key] as string[])[0];
        }
      });
    }
    next();
  });
  
  // Security logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Log suspicious activities
    const suspicious = [];
    
    // Check for SQL injection patterns
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b|;|\-\-)/gi;
    const url = req.url + JSON.stringify(req.body || {});
    if (sqlPattern.test(url)) {
      suspicious.push('Potential SQL injection');
    }
    
    // Check for XSS patterns
    const xssPattern = /<script|javascript:|onerror=|onload=/gi;
    if (xssPattern.test(url)) {
      suspicious.push('Potential XSS attempt');
    }
    
    // Check for path traversal
    if (req.url.includes('../') || req.url.includes('..\\')) {
      suspicious.push('Path traversal attempt');
    }
    
    if (suspicious.length > 0) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        suspicious,
        userAgent: req.get('user-agent')
      });
    }
    
    next();
  });
  
  logger.info('Security middleware applied', {
    cors: config.corsOrigin,
    rateLimit: `${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs}ms`,
    environment: config.nodeEnv
  });
};

// Error handler for security middleware
export const securityErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  next(err);
};