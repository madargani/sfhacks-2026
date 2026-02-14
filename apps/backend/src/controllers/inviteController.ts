import { Request, Response, NextFunction } from 'express';
import { InviteCodeModel } from '../models';
import { CreateInviteCode, RedeemInviteCode, ApiResponse } from '@evergreen/shared-types';
import { generateUniqueInviteCode } from '../utils';

export const inviteController = {
  async generateInviteCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { createdBy, expiresAt }: CreateInviteCode = req.body;
      
      let code = generateUniqueInviteCode();
      let existingCode = await InviteCodeModel.findOne({ code });
      
      while (existingCode) {
        code = generateUniqueInviteCode();
        existingCode = await InviteCodeModel.findOne({ code });
      }
      
      const inviteCode = await InviteCodeModel.create({
        code,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isUsed: false,
      });
      
      const response: ApiResponse<typeof inviteCode> = {
        success: true,
        data: inviteCode,
        message: 'Invite code generated successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async redeemInviteCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, userId }: RedeemInviteCode = req.body;
      
      const inviteCode = await InviteCodeModel.findOne({ code: code.toUpperCase() });
      
      if (!inviteCode) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid invite code',
        };
        res.status(400).json(response);
        return;
      }
      
      if (inviteCode.isUsed) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invite code has already been used',
        };
        res.status(400).json(response);
        return;
      }
      
      if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invite code has expired',
        };
        res.status(400).json(response);
        return;
      }
      
      inviteCode.isUsed = true;
      inviteCode.usedBy = userId;
      inviteCode.usedAt = new Date();
      await inviteCode.save();
      
      const response: ApiResponse<typeof inviteCode> = {
        success: true,
        data: inviteCode,
        message: 'Invite code redeemed successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getUserInviteCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      const inviteCodes = await InviteCodeModel.find({ createdBy: userId })
        .sort({ createdAt: -1 });
      
      const response: ApiResponse<typeof inviteCodes> = {
        success: true,
        data: inviteCodes,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async validateInviteCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const codeString = code as string;
      
      const inviteCode = await InviteCodeModel.findOne({ code: codeString.toUpperCase() });
      
      if (!inviteCode) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid invite code',
        };
        res.status(400).json(response);
        return;
      }
      
      if (inviteCode.isUsed) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invite code has already been used',
        };
        res.status(400).json(response);
        return;
      }
      
      if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invite code has expired',
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Invite code is valid',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
