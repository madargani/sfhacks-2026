import mongoose, { Schema, Document, Types } from 'mongoose';
import type { RideRequest, Location } from '@evergreen/shared-types';

interface LocationDocument extends Location, Document {}

export interface RideRequestDocument extends RideRequest, Document {
  _id: Types.ObjectId;
}

const LocationSchema = new Schema<LocationDocument>(
  {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
  },
  { _id: false }
);

const RideRequestSchema = new Schema<RideRequestDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    fromLocation: {
      type: LocationSchema,
      required: [true, 'From location is required'],
    },
    toLocation: {
      type: LocationSchema,
      required: [true, 'To location is required'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time are required'],
      index: true,
    },
    passengers: {
      type: Number,
      required: [true, 'Number of passengers is required'],
      min: [1, 'Minimum 1 passenger required'],
      max: [10, 'Maximum 10 passengers allowed'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RideRequestModel = mongoose.model<RideRequestDocument>('RideRequest', RideRequestSchema);
