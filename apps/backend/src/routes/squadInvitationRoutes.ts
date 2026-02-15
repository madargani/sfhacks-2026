import { Router } from 'express';
import { squadInvitationController } from '../controllers';
import { validateRequiredFields, validateObjectId } from '../middleware';

const router = Router();

router.post(
  '/',
  validateRequiredFields(['fromUserId', 'toUserId']),
  squadInvitationController.createInvitation
);

router.get('/:userId', squadInvitationController.getUserInvitations);

router.put(
  '/:id/respond',
  validateObjectId,
  validateRequiredFields(['status']),
  squadInvitationController.respondToInvitation
);

export default router;
