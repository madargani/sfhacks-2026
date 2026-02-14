import { Request, Response, NextFunction } from 'express';
import { RideOfferModel, NotificationModel } from '../models';
import { CreateRideOffer, UpdateRideOffer, ApiResponse } from '@evergreen/shared-types';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export const setRideOfferSocket = (socketIo: SocketServer): void => {
  io = socketIo;
};

const broadcastNewRideOffer = (rideOffer: unknown): void => {
  if (io) {
    io.emit('new-ride-offer', rideOffer);
  }
};

const broadcastRideUpdate = (rideOffer: unknown): void => {
  if (io) {
    io.emit('ride-updated', { type: 'offer', data: rideOffer });
  }
};

export const rideOfferController = {
  async getAllRideOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, userId } = req.query;
      
      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (userId) filter.userId = userId;
      
      const rideOffers = await RideOfferModel.find(filter)
        .sort({ dateTime: 1 })
        .populate('userId', 'name email');
      
      const response: ApiResponse<typeof rideOffers> = {
        success: true,
        data: rideOffers,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getRideOfferById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rideOffer = await RideOfferModel.findById(id).populate('userId', 'name email');
      
      if (!rideOffer) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride offer not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof rideOffer> = {
        success: true,
        data: rideOffer,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async createRideOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rideData: CreateRideOffer = req.body;
      
      const rideOffer = await RideOfferModel.create(rideData);
      
      broadcastNewRideOffer(rideOffer);
      
      const notification = await NotificationModel.create({
        userId: rideData.userId,
        type: 'new_ride_offer',
        title: 'New Ride Offer Created',
        message: `You created a ride offer from ${rideData.fromLocation.address} to ${rideData.toLocation.address}`,
        rideId: rideOffer._id.toString(),
        rideType: 'offer',
      });
      
      if (io) {
        io.to(rideData.userId).emit('notification', notification);
      }
      
      const response: ApiResponse<typeof rideOffer> = {
        success: true,
        data: rideOffer,
        message: 'Ride offer created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateRideOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateRideOffer = req.body;
      
      const rideOffer = await RideOfferModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!rideOffer) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride offer not found',
        };
        res.status(404).json(response);
        return;
      }
      
      broadcastRideUpdate(rideOffer);
      
      const notification = await NotificationModel.create({
        userId: rideOffer.userId,
        type: 'ride_updated',
        title: 'Ride Offer Updated',
        message: `Your ride offer has been updated`,
        rideId: rideOffer._id.toString(),
        rideType: 'offer',
      });
      
      if (io) {
        io.to(rideOffer.userId).emit('notification', notification);
      }
      
      const response: ApiResponse<typeof rideOffer> = {
        success: true,
        data: rideOffer,
        message: 'Ride offer updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteRideOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rideOffer = await RideOfferModel.findByIdAndDelete(id);
      
      if (!rideOffer) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride offer not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Ride offer deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
