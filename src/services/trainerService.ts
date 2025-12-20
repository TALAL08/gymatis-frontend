import { TrainerCreateRequest } from "@/models/interfaces/requests/TrainerCreateRequest";
import { TrainerUpdateRequest } from "@/models/interfaces/requests/TrainerUpdateRequest";
import { Trainer } from "@/models/interfaces/Trainer";
import { PaginatedResponse, PaginationParams } from "@/models/interfaces/PaginatedResponse";
import axiosClient from "@/utils/axios-client";
import { TrainerSalaryConfig, TrainerSalaryConfigCreateRequest, TrainerSalaryConfigUpdateRequest } from "@/models/interfaces/TrainerSalaryConfig";

export class TrainerService {
  static async getTrainersByGymPaginated(
    gymId: number,
    params: PaginationParams & { status?: string }
  ): Promise<PaginatedResponse<Trainer>> {
    const res = await axiosClient.get<PaginatedResponse<Trainer>>(`/trainers/gym/${gymId}/paginated`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        searchText: params.searchText || '',
        status: params.status || '',
      },
    });
    return res.data;
  }

  static async getTrainersByGym(gymId: number): Promise<Trainer[]> {
    const res = await axiosClient.get(`/trainers/gym/${gymId}`);
    return res.data;
  }

  static async getActiveTrainers(gymId: number): Promise<Trainer[]> {
    const res = await axiosClient.get(`/trainers/gym/${gymId}/active`);
    return res.data;
  }

  static async getTrainerById(id: number): Promise<Trainer> {
    const res = await axiosClient.get(`/trainers/${id}`);
    return res.data;
  }

    static async getTrainerByUserId(userId: string): Promise<Trainer> {
    const res = await axiosClient.get(`/trainers/getByUserId/${userId}`);
    return res.data;
  }

  static async createTrainer(payload: TrainerCreateRequest): Promise<Trainer> {
    const res = await axiosClient.post(`/trainers`, payload);
    return res.data;
  }
  static async uploadPhoto(trainerId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post(`/trainers/upload-photo/${trainerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // public URL
  }
  static async updateTrainer(
    id: number,
    payload: TrainerUpdateRequest
  ): Promise<Trainer> {
    const res = await axiosClient.put(`/trainers/${id}`, payload);
    return res.data;
  }

  static async deleteTrainer(id: number): Promise<void> {
    await axiosClient.delete(`/trainers/${id}`);
  }

  static async toggleTrainerStatus(
    id: number,
    isActive: boolean
  ): Promise<Trainer> {
    const res = await axiosClient.patch(`/trainers/${id}/status`, { isActive });
    return res.data;
  }

  static async getActiveMemberCount(trainerId: number, month: number, year: number): Promise<number> {
    const res = await axiosClient.get<{ count: number }>(`/trainers/${trainerId}/active-members-count`, {
      params: { month, year },
    });
    return res.data.count;
  }  

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
}
