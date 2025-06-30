// auth-roles.ts
import { ProfileDto } from "../../_models/user-model";

export function hasRole(profile: ProfileDto | null, role: string): boolean {
  return profile?.role === role;
}

export function hasAnyRole(profile: ProfileDto | null, roles: string[]): boolean {
  return profile ? roles.includes(profile.role) : false;
}