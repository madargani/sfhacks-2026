import mongoose, { Schema, Document, Types } from 'mongoose';
import type { Notification } from '@evergreen/shared-types';

export interface NotificationDocument extends Notification, Document {
  _id: Types.ObjectId;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['new_ride_request', 'new_ride_offer', 'ride_updated', 'ride_accepted', 'system'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    rideId: {
      type: String,
      index: true,
    },
    rideType: {
      type: String,
      enum: ['request', 'offer'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ createdAt: -1 });

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', NotificationSchema);
