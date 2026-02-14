import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models';
import { ApiResponse, CreateUserRequest, UpdateUserRequest } from '@evergreen/shared-types';

export const userController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 });
      
      const response: ApiResponse<typeof users> = {
        success: true,
        data: users,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User with this email already exists',
        };
        res.status(400).json(response);
        return;
      }
      
      const user = await UserModel.create(userData);
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        message: 'User created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      
      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findByIdAndDelete(id);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'User deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
