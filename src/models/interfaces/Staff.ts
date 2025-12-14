import { ApplicationUser } from "./ApplicationUser";
import { Gym } from "./Gym";



export interface Staff {
  id: number;
  gymId: number;
  userId: string;

  firstName: string;
  lastName: string;
  cnic?: string | null;

  photoUrl?: string | null;

  isActive: boolean;
  createdAt: string; // ISO string from API
  updatedAt: string;

  // optional expanded objects
  gym: Gym;
  user: ApplicationUser;
}
