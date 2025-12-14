import { InvoiceStatus } from "../enums/InvoiceStatus";
import { Gym } from "./Gym";
import { Member } from "./member";
import { Subscription } from "./Subscription";



export interface Invoice {
  id: number;
  gymId: number;
  memberId: number;
  subscriptionId: number;

  invoiceNumber: string;
  amount: number;
  discount: number;
  netAmount: number;

  status: InvoiceStatus;
  dueDate?: string | null;
  paidAt?: string | null;

  paymentMethod?: string | null;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;

  member: Member;
  subscription: Subscription;
  gym: Gym;
}
