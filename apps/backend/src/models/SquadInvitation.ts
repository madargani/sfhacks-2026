import mongoose, { Schema, Document, Types } from 'mongoose';
import type { SquadInvitation } from '@evergreen/shared-types';

export interface SquadInvitationDocument extends SquadInvitation, Document {
  _id: Types.ObjectId;
}

const SquadInvitationSchema = new Schema<SquadInvitationDocument>(
  {
    fromUserId: {
      type: String,
      required: [true, 'From user ID is required'],
    },
    toUserId: {
      type: String,
      required: [true, 'To user ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const SquadInvitationModel = mongoose.model<SquadInvitationDocument>(
  'SquadInvitation',
  SquadInvitationSchema
);
