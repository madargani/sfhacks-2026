import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@evergreen/shared-types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const response: ApiResponse<null> = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
  };

  res.status(404).json(response);
};
