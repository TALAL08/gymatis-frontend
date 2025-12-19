import { TrainerSalaryConfig, TrainerSalaryConfigCreateRequest, TrainerSalaryConfigUpdateRequest } from "@/models/interfaces/TrainerSalaryConfig";
import { SalarySlip, SalarySlipGenerateRequest, SalarySlipSummary } from "@/models/interfaces/SalarySlip";
import { PaginatedResponse, PaginationParams } from "@/models/interfaces/PaginatedResponse";
import axiosClient from "@/utils/axios-client";

export class TrainerSalaryService {
  // Salary Configuration APIs
  static async getSalaryConfig(trainerId: number): Promise<TrainerSalaryConfig | null> {
    const res = await axiosClient.get<TrainerSalaryConfig>(`/trainers/${trainerId}/salary-config`);
    return res.data;
  }

  static async createSalaryConfig(payload: TrainerSalaryConfigCreateRequest): Promise<TrainerSalaryConfig> {
    const res = await axiosClient.post<TrainerSalaryConfig>(`/trainers/salary-config`, payload);
    return res.data;
  }

  static async updateSalaryConfig(trainerId: number, payload: TrainerSalaryConfigUpdateRequest): Promise<TrainerSalaryConfig> {
    const res = await axiosClient.put<TrainerSalaryConfig>(`/trainers/${trainerId}/salary-config`, payload);
    return res.data;
  }

  // Salary Slip APIs
  static async getSalarySlipsByGymPaginated(
    gymId: number,
    params: PaginationParams & {
      trainerId?: number;
      month?: number;
      year?: number;
      paymentStatus?: string;
    }
  ): Promise<PaginatedResponse<SalarySlip>> {
    const res = await axiosClient.get<PaginatedResponse<SalarySlip>>(`/salary-slips/gym/${gymId}`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        searchText: params.searchText || '',
        trainerId: params.trainerId || '',
        month: params.month || '',
        year: params.year || '',
        paymentStatus: params.paymentStatus || '',
      },
    });
    return res.data;
  }

  static async getSalarySlipById(id: number): Promise<SalarySlip> {
    const res = await axiosClient.get<SalarySlip>(`/salary-slips/${id}`);
    return res.data;
  }

  static async generateSalarySlip(gymId: number, payload: SalarySlipGenerateRequest): Promise<SalarySlip> {
    const res = await axiosClient.post<SalarySlip>(`/salary-slips/gym/${gymId}/generate`, payload);
    return res.data;
  }

  static async markAsPaid(id: number): Promise<SalarySlip> {
    const res = await axiosClient.patch<SalarySlip>(`/salary-slips/${id}/mark-paid`);
    return res.data;
  }

  static async getSalarySlipSummary(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<SalarySlipSummary> {
    const res = await axiosClient.get<SalarySlipSummary>(`/salary-slips/gym/${gymId}/summary`, { params });
    return res.data;
  }

  static async getActiveMemberCount(trainerId: number, month: number, year: number): Promise<number> {
    const res = await axiosClient.get<{ count: number }>(`/trainers/${trainerId}/active-members-count`, {
      params: { month, year },
    });
    return res.data.count;
  }

  static async exportSalarySlipsPdf(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<Blob> {
    const res = await axiosClient.get(`/salary-slips/gym/${gymId}/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  }

  static async exportSalarySlipsCsv(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<Blob> {
    const res = await axiosClient.get(`/salary-slips/gym/${gymId}/export/csv`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  }

  static async downloadSalarySlipPdf(id: number): Promise<Blob> {
    const res = await axiosClient.get(`/salary-slips/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  }
}
