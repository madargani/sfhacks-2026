import { Router } from 'express';
import userRoutes from './userRoutes';
import rideRequestRoutes from './rideRequestRoutes';
import rideOfferRoutes from './rideOfferRoutes';
import notificationRoutes from './notificationRoutes';
import inviteRoutes from './inviteRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/rides/requests', rideRequestRoutes);
router.use('/rides/offers', rideOfferRoutes);
router.use('/notifications', notificationRoutes);
router.use('/invites', inviteRoutes);

export default router;
