import { TrainerSalaryConfig, TrainerSalaryConfigCreateRequest, TrainerSalaryConfigUpdateRequest } from "@/models/interfaces/TrainerSalaryConfig";
import { TrainerSalarySlip, SalarySlipGenerateRequest, TrainerSalarySlipSummary } from "@/models/interfaces/SalarySlip";
import { PaginatedResponse, PaginationParams } from "@/models/interfaces/PaginatedResponse";
import axiosClient from "@/utils/axios-client";

export class TrainerSalaryService {

  // Salary Slip APIs
  static async getSalarySlipsByGymPaginated(
    gymId: number,
    params: PaginationParams & {
      trainerId?: number;
      month?: number;
      year?: number;
      paymentStatus?: string;
    }
  ): Promise<PaginatedResponse<TrainerSalarySlip>> {
    const res = await axiosClient.get<PaginatedResponse<TrainerSalarySlip>>(`/salaryslips/gym/${gymId}/paginated`, {
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

  static async getSalarySlipById(id: number): Promise<TrainerSalarySlip> {
    const res = await axiosClient.get<TrainerSalarySlip>(`/salaryslips/${id}`);
    return res.data;
  }

  static async generateSalarySlip(gymId: number,trainerId: number, payload: SalarySlipGenerateRequest): Promise<TrainerSalarySlip> {
    const res = await axiosClient.post<TrainerSalarySlip>(`/salaryslips/gym/${gymId}/generate/${trainerId}`, payload);
    return res.data;
  }

  static async markAsPaid(id: string | number, accountId: string): Promise<TrainerSalarySlip> {
    const res = await axiosClient.post<TrainerSalarySlip>(`/salaryslips/${id}/mark-paid/${accountId}`);
    return res.data;
  }

  static async getSalarySlipSummary(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<TrainerSalarySlipSummary> {
    const res = await axiosClient.get<TrainerSalarySlipSummary>(`/salaryslips/gym/${gymId}/summary`, { params });
    return res.data;
  }

  static async exportSalarySlipsPdf(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<Blob> {
    const res = await axiosClient.get(`/salaryslips/gym/${gymId}/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  }

  static async exportSalarySlipsCsv(
    gymId: number,
    params: { trainerId?: number; month?: number; year?: number; paymentStatus?: string }
  ): Promise<Blob> {
    const res = await axiosClient.get(`/salaryslips/gym/${gymId}/export/csv`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  }

  static async downloadSalarySlipPdf(id: number): Promise<Blob> {
    const res = await axiosClient.get(`/salaryslips/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  }
}
