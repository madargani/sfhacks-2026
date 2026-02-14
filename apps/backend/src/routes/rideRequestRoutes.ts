import { Router } from 'express';
import { rideRequestController } from '../controllers';
import { validateRequiredFields, validateObjectId } from '../middleware';

const router = Router();

router.get('/', rideRequestController.getAllRideRequests);

router.get('/:id', validateObjectId, rideRequestController.getRideRequestById);

router.post(
  '/',
  validateRequiredFields(['userId', 'fromLocation', 'toLocation', 'dateTime', 'passengers']),
  rideRequestController.createRideRequest
);

router.put(
  '/:id',
  validateObjectId,
  rideRequestController.updateRideRequest
);

router.delete('/:id', validateObjectId, rideRequestController.deleteRideRequest);

export default router;
