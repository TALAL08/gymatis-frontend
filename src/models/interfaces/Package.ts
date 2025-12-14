export interface Package {
  id: number;
  gymId: number;

  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  visitsLimit?: number | null;
  allowsTrainerAddon: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}


