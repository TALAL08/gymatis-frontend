import { PaymentMethod } from "../enums/PaymentMethod";
import { Gym } from "./Gym";
import { Invoice } from "./Invoice";




export interface Transaction {
  id: number;
  gymId: number;
  invoiceId: number;

  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;

  paidAt: string;
  createdAt: string;

  gym: Gym;
  invoice: Invoice;
}
