import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models';
import { CreateNotification, ApiResponse } from '@evergreen/shared-types';

export const notificationController = {
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { isRead } = req.query;
      
      const filter: Record<string, unknown> = { userId };
      if (isRead !== undefined) filter.isRead = isRead === 'true';
      
      const notifications = await NotificationModel.find(filter)
        .sort({ createdAt: -1 });
      
      const response: ApiResponse<typeof notifications> = {
        success: true,
        data: notifications,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getNotificationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.findById(id);
      
      if (!notification) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Notification not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof notification> = {
        success: true,
        data: notification,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationData: CreateNotification = req.body;
      
      const notification = await NotificationModel.create(notificationData);
      
      const response: ApiResponse<typeof notification> = {
        success: true,
        data: notification,
        message: 'Notification created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const notification = await NotificationModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Notification not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof notification> = {
        success: true,
        data: notification,
        message: 'Notification marked as read',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      await NotificationModel.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'All notifications marked as read',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.findByIdAndDelete(id);
      
      if (!notification) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Notification not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Notification deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
