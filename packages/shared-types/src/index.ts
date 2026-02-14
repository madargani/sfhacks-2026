export * from './user';
export * from './ride';
export * from './notification';
export * from './invite';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
