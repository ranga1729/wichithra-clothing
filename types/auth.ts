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
}

export const ROLES = {
  CUSTOMER : "550e8400-e29b-41d4-a716-446655440001",
  ADMIN : "550e8400-e29b-41d4-a716-446655440002",
  SUPERADMIN : "550e8400-e29b-41d4-a716-446655440003"
}

export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  mobilePhoneNumber: string
  homePhoneNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  mobilePhoneNumber: string
  homePhoneNumber?: string
  houseNo: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  zipCode: string
}