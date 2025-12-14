import { StaffCreateRequest } from "@/models/interfaces/requests/StaffCreateRequest";
import { StaffUpdateRequest } from "@/models/interfaces/requests/StaffUpdateRequest";
import { Staff } from "@/models/interfaces/Staff";
import axiosClient from "@/utils/axios-client";

export class StaffService {
  static async getStaffsByGym(gymId: number): Promise<Staff[]> {
    const res = await axiosClient.get(`/staffs/gym/${gymId}`);
    return res.data;
  }

  static async getActiveStaffs(gymId: number): Promise<Staff[]> {
    const res = await axiosClient.get(`/staffs/gym/${gymId}/active`);
    return res.data;
  }

  static async getStaffById(id: number): Promise<Staff> {
    const res = await axiosClient.get(`/staffs/${id}`);
    return res.data;
  }

  static async createStaff(payload: StaffCreateRequest): Promise<Staff> {
    const res = await axiosClient.post(`/staffs`, payload);
    return res.data;
  }
  static async uploadPhoto(staffId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post(`/staffs/upload-photo/${staffId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // public URL
  }
  static async updateStaff(
    id: number,
    payload: StaffUpdateRequest
  ): Promise<Staff> {
    const res = await axiosClient.put(`/staffs/${id}`, payload);
    return res.data;
  }

  static async deleteStaff(id: number): Promise<void> {
    await axiosClient.delete(`/staffs/${id}`);
  }

  static async toggleStaffStatus(
    id: number,
    isActive: boolean
  ): Promise<Staff> {
    const res = await axiosClient.patch(`/staffs/${id}/status`, { isActive });
    return res.data;
  }
}
