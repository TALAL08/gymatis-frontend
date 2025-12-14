export interface Gym {
  id: string;
  name: string;
  logo?: string | null;  
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  timeZone?: string | null;
  createdAt: string;
}
