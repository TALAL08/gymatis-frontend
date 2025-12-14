export interface GymUpdateRequest {
  name: string;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  timeZone?: string | null;
}
