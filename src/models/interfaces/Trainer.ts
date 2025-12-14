// src/interfaces/Trainer.ts

import { ApplicationUser } from "./ApplicationUser";
import { Gym } from "./Gym";


export interface Trainer {
  id: number;
  gymId: number;
  userId: string;

  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;

  specialties?: string[] | null;
  bio?: string | null;

  pricePerSession: number;
  monthlyAddonPrice: number;

  photoUrl?: string | null;

  isActive: boolean;
  createdAt: string; // ISO string from API
  updatedAt: string;

  // optional expanded objects
  gym: Gym;
  user: ApplicationUser;
}

