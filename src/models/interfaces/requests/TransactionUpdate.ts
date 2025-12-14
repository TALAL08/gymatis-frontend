import { PaymentMethod } from "@/models/enums/PaymentMethod";



export interface TransactionUpdate {
  amount?: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  paidAt?: string;
}
