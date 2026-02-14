import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@evergreen/shared-types';

export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
};

export const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id as string;
  
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid ID format',
    };
    res.status(400).json(response);
    return;
  }

  next();
};
