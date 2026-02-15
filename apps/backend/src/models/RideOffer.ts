import mongoose, { Schema, Document, Types } from 'mongoose';
import type { RideOffer, Location } from '@evergreen/shared-types';

interface LocationDocument extends Location, Document {}

export interface RideOfferDocument extends RideOffer, Document {
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

const RideOfferSchema = new Schema<RideOfferDocument>(
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
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [1, 'Minimum 1 seat required'],
      max: [10, 'Maximum 10 seats allowed'],
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

export const RideOfferModel = mongoose.model<RideOfferDocument>('RideOffer', RideOfferSchema);
