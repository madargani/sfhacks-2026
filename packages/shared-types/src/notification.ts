export type NotificationType = 'new_ride_request' | 'new_ride_offer' | 'ride_updated' | 'ride_accepted' | 'system';

export interface Notification {
  _id?: string | unknown;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  rideId?: string;
  rideType?: 'request' | 'offer';
  isRead: boolean;
  createdAt?: Date;
}

export interface CreateNotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  rideId?: string;
  rideType?: 'request' | 'offer';
}

export interface MarkNotificationRead {
  isRead: boolean;
}
