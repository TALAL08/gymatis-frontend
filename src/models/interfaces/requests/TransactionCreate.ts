import { PaymentMethod } from "@/models/enums/PaymentMethod";



export interface TransactionCreate {
  gymId: number;
  invoiceId: number;

  amount: number;
  paymentMethod: PaymentMethod;
  accountId:number;
  referenceNumber?: string;
  notes?: string;

  paidAt: string;
}
