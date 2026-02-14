import mongoose, { Schema, Document, Types } from 'mongoose';
import type { InviteCode } from '@evergreen/shared-types';

export interface InviteCodeDocument extends InviteCode, Document {
  _id: Types.ObjectId;
}

const InviteCodeSchema = new Schema<InviteCodeDocument>(
  {
    code: {
      type: String,
      required: [true, 'Invite code is required'],
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Creator user ID is required'],
    },
    expiresAt: {
      type: Date,
    },
    usedBy: {
      type: String,
    },
    usedAt: {
      type: Date,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InviteCodeModel = mongoose.model<InviteCodeDocument>('InviteCode', InviteCodeSchema);
