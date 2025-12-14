import { AttendanceLog } from "@/models/interfaces/AttendanceLog";
import axiosClient from "@/utils/axios-client";

export class AttendanceService {

  static async getAttendanceByGym(gymId: number): Promise<AttendanceLog[]> {
    const res = await axiosClient.get(`/attendancelogs/gym/${gymId}`);
    return res.data;
  }

  static async getAttendanceByMember(memberId: number): Promise<AttendanceLog[]> {
    const res = await axiosClient.get(`/attendancelogs/member/${memberId}`);
    return res.data;
  }

    static async getTrainerMembersAttendnace(trainerId: number): Promise<AttendanceLog[]> {
    const res = await axiosClient.get(`/attendancelogs/members/GetByTrainerId/${trainerId}`);
    return res.data;
  }

  static async getTodayAttendance(gymId: number): Promise<AttendanceLog[]> {
    const res = await axiosClient.get(`/attendancelogs/gym/${gymId}/today`);
    return res.data;
  }

  static async getCurrentlyCheckedIn(gymId: number): Promise<AttendanceLog[]> {
    const res = await axiosClient.get(`/attendancelogs/gym/${gymId}/checked-in`);
    return res.data;
  }

  static async checkIn(payload: {
    gymId: number;
    memberId: number;
    checkedInBy: string;
    deviceInfo?: string;
  }): Promise<AttendanceLog> {
    const res = await axiosClient.post(`/attendancelogs/check-in`, payload);
    return res.data;
  }

  static async checkOut(attendanceId: number): Promise<AttendanceLog> {
    const res = await axiosClient.patch(`/attendancelogs/${attendanceId}/check-out`, {
      checkOutAt: new Date().toISOString()
    });
    return res.data;
  }

  static async getAttendanceStats(gymId: number, start: string, end: string) {
    const res = await axiosClient.get(`/attendancelogs/stats`, {
      params: { gymId, startDate: start, endDate: end }
    });
    return res.data;
  }

  static async getLatestAttendance(memberId: number): Promise<AttendanceLog | null> {
    const res = await axiosClient.get(`/attendancelogs/member/${memberId}/latest`);
    return res.data;
  }
}
