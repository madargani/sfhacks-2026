import { Request, Response, NextFunction } from 'express';
import { RideRequestModel, NotificationModel } from '../models';
import { CreateRideRequest, UpdateRideRequest, ApiResponse } from '@evergreen/shared-types';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export const setRideRequestSocket = (socketIo: SocketServer): void => {
  io = socketIo;
};

const broadcastNewRideRequest = (rideRequest: unknown): void => {
  if (io) {
    io.emit('new-ride-request', rideRequest);
  }
};

const broadcastRideUpdate = (rideRequest: unknown): void => {
  if (io) {
    io.emit('ride-updated', { type: 'request', data: rideRequest });
  }
};

export const rideRequestController = {
  async getAllRideRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, userId } = req.query;
      
      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (userId) filter.userId = userId;
      
      const rideRequests = await RideRequestModel.find(filter)
        .sort({ dateTime: 1 })
        .populate('userId', 'name email');
      
      const response: ApiResponse<typeof rideRequests> = {
        success: true,
        data: rideRequests,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getRideRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rideRequest = await RideRequestModel.findById(id).populate('userId', 'name email');
      
      if (!rideRequest) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride request not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof rideRequest> = {
        success: true,
        data: rideRequest,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async createRideRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rideData: CreateRideRequest = req.body;
      
      const rideRequest = await RideRequestModel.create(rideData);
      
      broadcastNewRideRequest(rideRequest);
      
      const notification = await NotificationModel.create({
        userId: rideData.userId,
        type: 'new_ride_request',
        title: 'New Ride Request Created',
        message: `You created a ride request from ${rideData.fromLocation.address} to ${rideData.toLocation.address}`,
        rideId: rideRequest._id.toString(),
        rideType: 'request',
      });
      
      if (io) {
        io.to(rideData.userId).emit('notification', notification);
      }
      
      const response: ApiResponse<typeof rideRequest> = {
        success: true,
        data: rideRequest,
        message: 'Ride request created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateRideRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateRideRequest = req.body;
      
      const rideRequest = await RideRequestModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!rideRequest) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride request not found',
        };
        res.status(404).json(response);
        return;
      }
      
      broadcastRideUpdate(rideRequest);
      
      const notification = await NotificationModel.create({
        userId: rideRequest.userId,
        type: 'ride_updated',
        title: 'Ride Request Updated',
        message: `Your ride request has been updated`,
        rideId: rideRequest._id.toString(),
        rideType: 'request',
      });
      
      if (io) {
        io.to(rideRequest.userId).emit('notification', notification);
      }
      
      const response: ApiResponse<typeof rideRequest> = {
        success: true,
        data: rideRequest,
        message: 'Ride request updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteRideRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rideRequest = await RideRequestModel.findByIdAndDelete(id);
      
      if (!rideRequest) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Ride request not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Ride request deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
