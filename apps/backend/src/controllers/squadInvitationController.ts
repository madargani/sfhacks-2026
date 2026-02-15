import { Request, Response, NextFunction } from 'express';
import { SquadInvitationModel } from '../models';
import { ApiResponse, CreateSquadInvitationRequest } from '@evergreen/shared-types';

export const squadInvitationController = {
  async createInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromUserId, toUserId }: CreateSquadInvitationRequest = req.body;

      // Check if invitation already exists
      const existing = await SquadInvitationModel.findOne({
        fromUserId,
        toUserId,
        status: 'pending',
      });

      if (existing) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Pending invitation already exists',
        };
        res.status(400).json(response);
        return;
      }

      const invitation = await SquadInvitationModel.create({
        fromUserId,
        toUserId,
        status: 'pending',
      });

      const response: ApiResponse<typeof invitation> = {
        success: true,
        data: invitation,
        message: 'Invitation created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getUserInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const invitations = await SquadInvitationModel.find({ toUserId: userId }).sort({
        createdAt: -1,
      });

      const response: ApiResponse<typeof invitations> = {
        success: true,
        data: invitations,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async respondToInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status }: { status: 'accepted' | 'declined' } = req.body;

      if (!['accepted', 'declined'].includes(status)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid status',
        };
        res.status(400).json(response);
        return;
      }

      const invitation = await SquadInvitationModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!invitation) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invitation not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof invitation> = {
        success: true,
        data: invitation,
        message: 'Invitation updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
