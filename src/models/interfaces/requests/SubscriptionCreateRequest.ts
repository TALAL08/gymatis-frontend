


export interface SubscriptionCreateRequest {
  gymId: number;
  memberId: number;
  packageId: number;
  trainerId?: number | null;

  startDate: string;
  endDate: string;

  pricePaid: number;
  trainerAddonPrice: number;

  notes?: string | null;
}
