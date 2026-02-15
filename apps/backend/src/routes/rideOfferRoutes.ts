import { Router } from 'express';
import { rideOfferController } from '../controllers';
import { validateRequiredFields, validateObjectId } from '../middleware';

const router = Router();

router.get('/', rideOfferController.getAllRideOffers);

router.get('/:id', validateObjectId, rideOfferController.getRideOfferById);

router.post(
  '/',
  validateRequiredFields(['userId', 'fromLocation', 'toLocation', 'dateTime', 'availableSeats']),
  rideOfferController.createRideOffer
);

router.put(
  '/:id',
  validateObjectId,
  rideOfferController.updateRideOffer
);

router.post(
  '/:id/join',
  validateObjectId,
  validateRequiredFields(['userId']),
  rideOfferController.joinRideOffer
);

router.post(
  '/:id/leave',
  validateObjectId,
  validateRequiredFields(['userId']),
  rideOfferController.leaveRideOffer
);

router.delete('/:id', validateObjectId, rideOfferController.deleteRideOffer);

export default router;
