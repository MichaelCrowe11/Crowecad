import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { config } from "./config/environment";
import { logger, requestLogger, errorLogger } from "./config/logger";
import { applySecurityMiddleware, securityErrorHandler } from "./middleware/security";
import healthRoutes from "./middleware/health";

const app = express();

// Apply security middleware first
applySecurityMiddleware(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check routes (before authentication)
app.use('/', healthRoutes);

// Request logging (only in development or if LOG_LEVEL is debug)
if (config.isDevelopment || config.logLevel === 'debug') {
  app.use(requestLogger);
}

(async () => {
  const server = await registerRoutes(app);

  // Error logging middleware
  app.use(errorLogger);
  
  // Security error handler
  app.use(securityErrorHandler);
  
  // General error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = config.isProduction 
      ? "Internal Server Error" 
      : err.message || "Internal Server Error";

    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      status
    });

    res.status(status).json({ 
      error: message,
      ...(config.isDevelopment && { stack: err.stack })
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server configuration
  const port = config.port;
  const host = config.isProduction ? '0.0.0.0' : 'localhost';
  
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    logger.info('🚀 Server started', {
      port,
      host,
      environment: config.nodeEnv,
      pid: process.pid
    });
    
    console.log(`
╔════════════════════════════════════════════╗
║         CroweCad Server Started            ║
╠════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(28)} ║
║  Port: ${String(port).padEnd(36)} ║
║  Health: http://${host}:${port}/health ${' '.repeat(14 - host.length)} ║
║  API: http://${host}:${port}/api ${' '.repeat(18 - host.length)} ║
║  APS Viewer: http://${host}:${port}/aps-viewer ${' '.repeat(6 - host.length)} ║
╚════════════════════════════════════════════╝
    `);
  });
})();
