export type RideStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface RideRequest {
  _id?: string | unknown;
  userId: string;
  fromLocation: Location;
  toLocation: Location;
  dateTime: Date;
  passengers: number;
  notes?: string;
  status: RideStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RideOffer {
  _id?: string | unknown;
  userId: string;
  fromLocation: Location;
  toLocation: Location;
  dateTime: Date;
  availableSeats: number;
  joinedUserIds?: string[];
  notes?: string;
  status: RideStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRideRequest {
  userId: string;
  fromLocation: Location;
  toLocation: Location;
  dateTime: Date;
  passengers: number;
  notes?: string;
}

export interface CreateRideOffer {
  userId: string;
  fromLocation: Location;
  toLocation: Location;
  dateTime: Date;
  availableSeats: number;
  notes?: string;
}

export interface UpdateRideRequest {
  fromLocation?: Location;
  toLocation?: Location;
  dateTime?: Date;
  passengers?: number;
  notes?: string;
  status?: RideStatus;
}

export interface UpdateRideOffer {
  fromLocation?: Location;
  toLocation?: Location;
  dateTime?: Date;
  availableSeats?: number;
  notes?: string;
  status?: RideStatus;
}
