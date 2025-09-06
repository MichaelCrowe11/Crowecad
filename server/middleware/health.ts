import { Router, Request, Response } from 'express';
import { config } from '../config/environment';
import { db, pool } from '../db';
import { logger } from '../config/logger';
import os from 'os';
import fs from 'fs';

const router = Router();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// Liveness probe (for Kubernetes)
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe (checks if app is ready to serve traffic)
router.get('/health/ready', async (req: Request, res: Response) => {
  const checks = {
    server: true,
    database: false,
    aps: false,
    filesystem: false
  };

  try {
    // Check database connection
    if (config.databaseUrl) {
      try {
        await pool.query('SELECT 1');
        checks.database = true;
      } catch (err) {
        logger.error('Database health check failed', { error: err });
      }
    }

    // Check APS configuration
    if (config.aps.clientId && config.aps.clientSecret) {
      checks.aps = true;
    }

    // Check filesystem (temp directory)
    try {
      const tempDir = config.upload.tempDir;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.accessSync(tempDir, fs.constants.W_OK);
      checks.filesystem = true;
    } catch (err) {
      logger.error('Filesystem health check failed', { error: err });
    }

    const allHealthy = Object.values(checks).every(v => v === true);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks
    });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({
      status: 'not ready',
      checks,
      error: 'Health check failed'
    });
  }
});

// Detailed health check (for monitoring systems)
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // System metrics
    const systemMetrics = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: {
        process: process.uptime(),
        system: os.uptime()
      },
      memory: {
        process: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        system: {
          total: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
          free: Math.round(os.freemem() / 1024 / 1024) + ' MB',
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024) + ' MB'
        }
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model,
        usage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        loadAverage: os.loadavg()
      }
    };

    // Service checks
    const services = {
      database: 'unknown',
      redis: 'unknown',
      aps: 'unknown',
      openai: 'unknown'
    };

    // Check database
    if (config.databaseUrl) {
      try {
        const result = await pool.query('SELECT version()');
        services.database = 'healthy';
      } catch (err) {
        services.database = 'unhealthy';
      }
    } else {
      services.database = 'not configured';
    }

    // Check Redis (if configured)
    if (config.redisUrl) {
      // TODO: Implement Redis health check
      services.redis = 'not implemented';
    } else {
      services.redis = 'not configured';
    }

    // Check APS
    services.aps = config.aps.clientId ? 'configured' : 'not configured';

    // Check OpenAI
    services.openai = config.openaiApiKey ? 'configured' : 'not configured';

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      metrics: systemMetrics,
      services,
      features: config.features
    });
  } catch (error) {
    logger.error('Detailed health check failed', { error });
    res.status(500).json({
      status: 'error',
      error: 'Failed to generate health report'
    });
  }
});

// Metrics endpoint (Prometheus format)
router.get('/metrics', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = [
    `# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.`,
    `# TYPE nodejs_heap_size_total_bytes gauge`,
    `nodejs_heap_size_total_bytes ${memoryUsage.heapTotal}`,
    '',
    `# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js in bytes.`,
    `# TYPE nodejs_heap_size_used_bytes gauge`,
    `nodejs_heap_size_used_bytes ${memoryUsage.heapUsed}`,
    '',
    `# HELP nodejs_external_memory_bytes Process external memory from Node.js in bytes.`,
    `# TYPE nodejs_external_memory_bytes gauge`,
    `nodejs_external_memory_bytes ${memoryUsage.external}`,
    '',
    `# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.`,
    `# TYPE process_cpu_user_seconds_total counter`,
    `process_cpu_user_seconds_total ${cpuUsage.user / 1000000}`,
    '',
    `# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.`,
    `# TYPE process_cpu_system_seconds_total counter`,
    `process_cpu_system_seconds_total ${cpuUsage.system / 1000000}`,
    '',
    `# HELP process_uptime_seconds Total uptime in seconds.`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime()}`,
    ''
  ].join('\n');

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});

export default router;