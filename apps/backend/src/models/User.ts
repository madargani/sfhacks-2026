import mongoose, { Schema, Document, Types } from 'mongoose';
import type { User } from '@evergreen/shared-types';

export interface UserDocument extends User, Document {
  _id: Types.ObjectId;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
