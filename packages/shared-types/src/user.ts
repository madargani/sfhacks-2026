export interface User {
  _id?: string | unknown;
  name: string;
  email: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}
