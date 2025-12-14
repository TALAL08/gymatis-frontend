
export interface TrainerCreateRequest {
  gymId: number;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string | null;
  email?: string | null;
  specialties?: string[] | null;
  bio?: string | null;
  pricePerSession?: number | null;
  monthlyAddonPrice?: number | null;
  photoUrl?: string | null;
}
