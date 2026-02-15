const listeners = new Set<(ids: Set<string>) => void>();
const joinedRideIds = new Set<string>();

const emit = () => {
  const snapshot = new Set(joinedRideIds);
  listeners.forEach((listener) => listener(snapshot));
};

export const getMockJoinedRideIds = () => new Set(joinedRideIds);

export const hasMockJoinedRide = (rideId: string) => joinedRideIds.has(rideId);

export const joinMockRide = (rideId: string) => {
  if (!rideId) {
    return;
  }
  joinedRideIds.add(rideId);
  emit();
};

export const leaveMockRide = (rideId: string) => {
  if (!rideId) {
    return;
  }
  joinedRideIds.delete(rideId);
  emit();
};

export const subscribeToMockJoinedRides = (
  listener: (ids: Set<string>) => void
) => {
  listeners.add(listener);
  listener(new Set(joinedRideIds));
  return () => {
    listeners.delete(listener);
  };
};
