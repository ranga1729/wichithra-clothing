export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string  
}

export interface AuthResponse {
  user : {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  token: string
}

export interface JwtPayload {
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: string,

  exp?: number;
  iat?: number;
  sub?: string;  
}

export const ROLES = {
  CUSTOMER : "550e8400-e29b-41d4-a716-446655440001",
  ADMIN : "550e8400-e29b-41d4-a716-446655440002",
  SUPERADMIN : "550e8400-e29b-41d4-a716-446655440003"
}

export type UserRole = "customer" | "admin" | "super-admin"