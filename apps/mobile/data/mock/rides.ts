export interface UpcomingRide {
  id: string;
  from: string;
  to: string;
  dateTime: string;
  type: 'offering' | 'requesting';
  driverName?: string;
  passengers: number;
}

export const mockRides: UpcomingRide[] = [
  {
    id: '1',
    from: 'San Francisco State University',
    to: 'Downtown SF',
    dateTime: 'Today, 5:30 PM',
    type: 'offering',
    driverName: 'Isaiah Alvarez',
    passengers: 3,
  },
  {
    id: '2',
    from: 'Mission District',
    to: 'SF State',
    dateTime: 'Tomorrow, 8:00 AM',
    type: 'requesting',
    passengers: 1,
  },
  {
    id: '3',
    from: 'SF State',
    to: 'Oakland',
    dateTime: 'Fri, 4:00 PM',
    type: 'offering',
    driverName: 'Hayden Ancheta',
    passengers: 2,
  },
];

export const mockCarbonSaved = 1234;
