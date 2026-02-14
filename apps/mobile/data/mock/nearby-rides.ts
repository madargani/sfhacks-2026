/**
 * Mock data for nearby rides page - people offering and requesting rides
 */

export interface NearbyOfferingRide {
  id: string;
  destination: string;
  origin?: string;
  milesAway: number;
  totalSeats: 5 | 6 | 7 | 8;
  availableSeats: number;
  driverName: string;
  departureTime: string;
}

export interface NearbyRequestingRide {
  id: string;
  destination: string;
  origin?: string;
  milesAway: number;
  requesterName: string;
  requestedFor: string;
}

export const mockNearbyOfferings: NearbyOfferingRide[] = [
  {
    id: "1",
    destination: "Downtown SF",
    origin: "SF State",
    milesAway: 2.3,
    totalSeats: 5,
    availableSeats: 3,
    driverName: "Alex Chen",
    departureTime: "5:30 PM",
  },
  {
    id: "2",
    destination: "Oakland",
    origin: "Mission District",
    milesAway: 4.1,
    totalSeats: 7,
    availableSeats: 4,
    driverName: "Jordan Smith",
    departureTime: "6:00 PM",
  },
  {
    id: "3",
    destination: "SJSU",
    origin: "SOMA",
    milesAway: 0.8,
    totalSeats: 6,
    availableSeats: 2,
    driverName: "Sam Rivera",
    departureTime: "4:45 PM",
  },
  {
    id: "4",
    destination: "Berkeley",
    origin: "Castro",
    milesAway: 5.2,
    totalSeats: 8,
    availableSeats: 5,
    driverName: "Casey Nguyen",
    departureTime: "5:15 PM",
  },
];

export const mockNearbyRequests: NearbyRequestingRide[] = [
  {
    id: "1",
    destination: "SF State",
    origin: "Mission District",
    milesAway: 1.5,
    requesterName: "Taylor Kim",
    requestedFor: "Tomorrow 8:00 AM",
  },
  {
    id: "2",
    destination: "Downtown SF",
    origin: "Sunset",
    milesAway: 3.2,
    requesterName: "Morgan Lee",
    requestedFor: "Today 6:00 PM",
  },
  {
    id: "3",
    destination: "Oakland",
    origin: "Marina",
    milesAway: 6.0,
    requesterName: "Jordan Blake",
    requestedFor: "Fri 4:00 PM",
  },
  {
    id: "4",
    destination: "SJSU",
    origin: "SOMA",
    milesAway: 0.5,
    requesterName: "Skyler Reed",
    requestedFor: "Today 5:00 PM",
  },
];
