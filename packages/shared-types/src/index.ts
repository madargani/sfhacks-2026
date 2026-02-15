export * from './user';
export * from './ride';
export * from './notification';
export * from './invite';
export * from './squad';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
