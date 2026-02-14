export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  co2Saved: number;
  totalDrives: number;
  totalRides: number;
  memberSince: string;
}

export const mockUserProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "jdoe@sfsu.edu",
  address: "1600 Holloway Avenue",
  city: "San Francisco",
  state: "CA",
  zipCode: "94132",
  co2Saved: 847,
  totalDrives: 23,
  totalRides: 41,
  memberSince: "September 2024",
};
