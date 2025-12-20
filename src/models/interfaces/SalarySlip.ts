import { Trainer } from "./Trainer";

export type PaymentStatus = "unpaid" | "paid";

export interface TrainerSalarySlip {
  id: number;
  trainerId: number;
  month: number; // 1-12
  year: number;
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
  salaryMonth: number;
  salaryYear: number;
}

export interface TrainerSalarySlipSummary {
  totalSalaryPayout: number;
  totalIncentives: number;
  totalBaseSalary: number;
  slipCount: number;
}
