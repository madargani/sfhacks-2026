import { Router } from 'express';
import { userController } from '../controllers';
import { validateRequiredFields, validateObjectId } from '../middleware';

const router = Router();

router.get('/', userController.getAllUsers);

router.get('/:id', validateObjectId, userController.getUserById);

router.post(
  '/',
  validateRequiredFields(['name', 'email']),
  userController.createUser
);

router.put(
  '/:id',
  validateObjectId,
  userController.updateUser
);

router.delete('/:id', validateObjectId, userController.deleteUser);

export default router;
