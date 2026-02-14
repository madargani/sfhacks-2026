import { Router } from 'express';
import { notificationController } from '../controllers';
import { validateRequiredFields, validateObjectId } from '../middleware';

const router = Router();

router.get('/user/:userId', notificationController.getUserNotifications);

router.get('/:id', validateObjectId, notificationController.getNotificationById);

router.post(
  '/',
  validateRequiredFields(['userId', 'type', 'title', 'message']),
  notificationController.createNotification
);

router.put('/:id/read', validateObjectId, notificationController.markAsRead);

router.put('/user/:userId/read-all', notificationController.markAllAsRead);

router.delete('/:id', validateObjectId, notificationController.deleteNotification);

export default router;
