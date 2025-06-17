export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  stayLoggedIn: boolean;
}

export interface SocialLoginDto {
  token: string;
  stayLoggedIn: boolean;
  //endpoint: string;
}

export interface ProfileDto {
  name: string;
  email: string;
  profilePicture?: string;
}

export interface UpdateProfilePictureDto {
  profilePicture?: string;
}