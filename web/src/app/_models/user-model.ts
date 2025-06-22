// src/app/_models/user-model.ts

// Align with backend's RegisterDto (expects 'name' instead of 'username')
export interface RegisterDto {
  name: string; // Changed from 'username' to match backend
  email: string;
  password: string;
}

// LoginDto is correct
export interface LoginDto {
  email: string;
  password: string;
  stayLoggedIn: boolean;
  deviceId: string; // Add this field
}

// SocialLoginDto is correct (endpoint removed as per updated service)
export interface SocialLoginDto {
  token: string;
  stayLoggedIn?: boolean; // Made optional to align with Google login (no stayLoggedIn)
  deviceId: string; // Add this field
}

// ProfileDto updated to include optional 'id'
export interface ProfileDto {
  id?: number; // Added to match backend
  name: string;
  email: string;
  profilePicture?: string | null; // Explicitly allow null
}

// UpdateProfilePictureDto is correct
export interface UpdateProfilePictureDto {
  profilePicture?: string;
}

// ApiResponse is correct
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  statusCode: number;
}