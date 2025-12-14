import { Gym } from "@/models/interfaces/Gym";
import { GymUpdateRequest } from "@/models/interfaces/requests/GymUpdateRequest";
import axiosClient from "@/utils/axios-client";

export class GymService {


  static async getGymById(gymId: number): Promise<Gym> {
    const res = await axiosClient.get<Gym>(`/gyms/${gymId}`);
    return res.data;
  }


  static async updateGym(gymId: number, updates: GymUpdateRequest) {
    const res = await axiosClient.put(`/gyms/${gymId}`, updates);
    return res.data;
  }

  static async uploadPhoto(gymId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post(`/gyms/upload-photo/${gymId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // public URL
  }
}
