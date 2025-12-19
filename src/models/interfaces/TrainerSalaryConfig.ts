export interface TrainerSalaryConfig {
  id: number;
  trainerId: number;
  baseSalary: number;
  perMemberIncentive: number;
  effectiveFrom: string; // ISO date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerSalaryConfigCreateRequest {
  trainerId: number;
  baseSalary: number;
  perMemberIncentive: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface TrainerSalaryConfigUpdateRequest {
  baseSalary?: number;
  perMemberIncentive?: number;
  effectiveFrom?: string;
  isActive?: boolean;
}
