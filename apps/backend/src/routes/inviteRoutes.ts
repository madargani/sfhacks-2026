import { Router } from 'express';
import { inviteController } from '../controllers';
import { validateRequiredFields } from '../middleware';

const router = Router();

router.post(
  '/',
  validateRequiredFields(['createdBy']),
  inviteController.generateInviteCode
);

router.post(
  '/redeem',
  validateRequiredFields(['code', 'userId']),
  inviteController.redeemInviteCode
);

router.get('/user/:userId', inviteController.getUserInviteCodes);

router.get('/validate/:code', inviteController.validateInviteCode);

export default router;
