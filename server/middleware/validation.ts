import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      path: req.path,
      errors: errors.array()
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined
      }))
    });
  }
  
  next();
};

// Common validators
export const validators = {
  // ID validators
  uuidParam: (paramName: string = 'id') => 
    param(paramName)
      .isUUID()
      .withMessage('Must be a valid UUID'),
  
  // Pagination validators
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  // File upload validators
  fileUpload: [
    body('file')
      .custom((value, { req }) => {
        if (!req.files || !req.files.file) {
          throw new Error('No file uploaded');
        }
        const file = req.files.file as any;
        
        // Check file size (50MB max)
        if (file.size > 52428800) {
          throw new Error('File size exceeds 50MB limit');
        }
        
        // Check file type for CAD files
        const allowedMimes = [
          'application/octet-stream', // Generic binary
          'application/x-dwg',
          'application/x-dxf',
          'application/sla',
          'application/vnd.ms-pki.stl',
          'application/step',
          'model/iges',
          'model/mesh',
          'model/vnd.collada+xml'
        ];
        
        const allowedExtensions = [
          '.dwg', '.dxf', '.rvt', '.rfa', '.ipt', '.iam',
          '.step', '.stp', '.iges', '.igs', '.sat',
          '.3ds', '.obj', '.stl', '.fbx', '.dae',
          '.f3d', '.f3z', '.sldprt', '.sldasm'
        ];
        
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
          throw new Error(`File type ${fileExt} not supported`);
        }
        
        return true;
      })
  ],
  
  // APS validators
  apsUpload: [
    query('bucketKey')
      .optional()
      .isAlphanumeric('en-US', { ignore: '-_' })
      .isLength({ min: 3, max: 128 })
      .withMessage('Bucket key must be 3-128 characters, alphanumeric with hyphens/underscores'),
    query('objectName')
      .optional()
      .isLength({ min: 1, max: 256 })
      .withMessage('Object name must be 1-256 characters')
  ],
  
  apsTranslate: [
    body('urn')
      .notEmpty()
      .withMessage('URN is required')
      .isBase64()
      .withMessage('URN must be base64 encoded'),
    body('rootFilename')
      .optional()
      .isString()
      .withMessage('Root filename must be a string')
  ],
  
  // Project validators
  createProject: [
    body('name')
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Project name must be 1-255 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters')
  ],
  
  // Facility validators
  createFacility: [
    body('name')
      .notEmpty()
      .withMessage('Facility name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Facility name must be 1-255 characters'),
    body('type')
      .notEmpty()
      .isIn(['indoor', 'outdoor', 'greenhouse', 'warehouse'])
      .withMessage('Invalid facility type'),
    body('width')
      .isFloat({ min: 1, max: 10000 })
      .withMessage('Width must be between 1 and 10000'),
    body('height')
      .isFloat({ min: 1, max: 10000 })
      .withMessage('Height must be between 1 and 10000'),
    body('projectId')
      .isUUID()
      .withMessage('Project ID must be a valid UUID')
  ],
  
  // Equipment validators
  createEquipment: [
    body('name')
      .notEmpty()
      .withMessage('Equipment name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Equipment name must be 1-255 characters'),
    body('type')
      .notEmpty()
      .isIn(['bioreactor', 'processing', 'storage', 'environmental', 'utility'])
      .withMessage('Invalid equipment type'),
    body('x')
      .isFloat({ min: 0 })
      .withMessage('X position must be a positive number'),
    body('y')
      .isFloat({ min: 0 })
      .withMessage('Y position must be a positive number'),
    body('facilityId')
      .isUUID()
      .withMessage('Facility ID must be a valid UUID')
  ],
  
  // Command validators
  createCommand: [
    body('command')
      .notEmpty()
      .withMessage('Command is required')
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Command must be 1-500 characters')
      .matches(/^[a-zA-Z0-9\s\-_.,!?'"]+$/)
      .withMessage('Command contains invalid characters'),
    body('type')
      .optional()
      .isIn(['navigation', 'creation', 'modification', 'query', 'analysis'])
      .withMessage('Invalid command type')
  ],
  
  // Sanitization helpers
  sanitizeInput: [
    body('*').escape(),
    query('*').escape(),
    param('*').escape()
  ]
};

// Custom validators for specific routes
export const customValidators = {
  // Validate environment-specific requirements
  productionOnly: (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      return res.status(403).json({
        error: 'This endpoint is only available in production'
      });
    }
    next();
  },
  
  // Validate API key
  apiKey: (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required'
      });
    }
    
    // TODO: Validate against database or config
    if (apiKey !== process.env.API_KEY) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }
    
    next();
  }
};

// Export combined middleware chains
export const validate = {
  project: {
    create: [...validators.createProject, handleValidationErrors],
    update: [...validators.createProject, handleValidationErrors],
    get: [validators.uuidParam('id'), handleValidationErrors],
    list: [...validators.pagination, handleValidationErrors]
  },
  
  facility: {
    create: [...validators.createFacility, handleValidationErrors],
    update: [...validators.createFacility, handleValidationErrors],
    get: [validators.uuidParam('id'), handleValidationErrors],
    list: [...validators.pagination, handleValidationErrors]
  },
  
  equipment: {
    create: [...validators.createEquipment, handleValidationErrors],
    update: [...validators.createEquipment, handleValidationErrors],
    get: [validators.uuidParam('id'), handleValidationErrors],
    list: [...validators.pagination, handleValidationErrors]
  },
  
  aps: {
    upload: [...validators.apsUpload, validators.fileUpload, handleValidationErrors],
    translate: [...validators.apsTranslate, handleValidationErrors],
    manifest: [validators.uuidParam('urn'), handleValidationErrors]
  },
  
  command: {
    create: [...validators.createCommand, handleValidationErrors]
  }
};