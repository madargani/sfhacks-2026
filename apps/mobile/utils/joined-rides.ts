const listeners = new Set<(ids: Set<string>) => void>();
const joinedRideIds = new Set<string>();

const emit = () => {
  const snapshot = new Set(joinedRideIds);
  listeners.forEach((listener) => listener(snapshot));
};

export const getJoinedRideIds = () => new Set(joinedRideIds);

export const hasJoinedRide = (rideId: string) => joinedRideIds.has(rideId);

export const joinRide = (rideId: string) => {
  if (!rideId) {
    return;
  }
  joinedRideIds.add(rideId);
  emit();
};

export const leaveRide = (rideId: string) => {
  if (!rideId) {
    return;
  }
  joinedRideIds.delete(rideId);
  emit();
};

export const subscribeToJoinedRides = (
  listener: (ids: Set<string>) => void
) => {
  listeners.add(listener);
  listener(new Set(joinedRideIds));
  return () => {
    listeners.delete(listener);
  };
};
