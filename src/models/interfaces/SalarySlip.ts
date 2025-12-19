import { Trainer } from "./Trainer";

export type PaymentStatus = "unpaid" | "paid";

export interface SalarySlip {
  id: number;
  gymId: number;
  trainerId: number;
  salaryMonth: number; // 1-12
  salaryYear: number;
  baseSalary: number;
  activeMemberCount: number;
  perMemberIncentive: number;
  incentiveTotal: number;
  grossSalary: number;
  paymentStatus: PaymentStatus;
  paidAt?: string | null;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Expanded
  trainer?: Trainer;
}

export interface SalarySlipGenerateRequest {
  trainerId: number;
  salaryMonth: number;
  salaryYear: number;
}

export interface SalarySlipSummary {
  totalSalaryPayout: number;
  totalIncentives: number;
  totalBaseSalary: number;
  slipCount: number;
}
