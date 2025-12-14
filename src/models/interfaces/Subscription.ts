import { InvoiceStatus } from "../enums/InvoiceStatus";
import { SubscriptionStatus } from "../enums/SubscriptionStatus";
import { Member } from "./member";
import { Package } from "./Package";
import { Trainer } from "./Trainer";


export interface Subscription {
  id: number;
  gymId: number;
  memberId: number;
  packageId: number;
  trainerId?: number | null;

  startDate: string;
  endDate: string;

  pricePaid: number;
  trainerAddonPrice: number;

  status: SubscriptionStatus;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;

  member?: Member;
  package?: Package;
  trainer?: Trainer;
}
