
export interface ApplicationUser {
  id: string;
  email?: string;
  phoneNumber?: string | null;
  name?: string | null;
  lastLogin?: string | null;
  isBlocked: boolean;
  blockedOn?: string | null;
  blockedReason?: string | null;
  userType: number;
}



