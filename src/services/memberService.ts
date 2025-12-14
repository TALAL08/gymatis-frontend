import { Member } from "@/models/interfaces/member";
import axiosClient from "@/utils/axios-client";

export class MemberService {

  static async getMembersByGym(gymId: number): Promise<Member[]> {
    const res = await axiosClient.get<Member[]>(`/members/gym/${gymId}`);
    return res.data;
  }

  static async getMembersByTrainerId(trainerId: number): Promise<Member[]> {
    const res = await axiosClient.get<Member[]>(`/members/GetByTrainerId/${trainerId}`);
    return res.data;
  }  

  static async getMemberById(memberId: number): Promise<Member> {
    const res = await axiosClient.get<Member>(`/members/${memberId}`);
    return res.data;
  }

  static async getMemberWithDetails(memberId: number) {
    const res = await axiosClient.get(`/members/${memberId}/details`);
    return res.data;
  }

  static async getMemberByUserId(userId: string):Promise<Member> {
    const res = await axiosClient.get(`/members/by-user/${userId}`);
    return res.data;
  }

  static async getMemberCardDetails(memberId: number):Promise<Member> {
    const res = await axiosClient.get<Member>(`/members/${memberId}/member-card`);
    return res.data;
  }

  static async createMember(memberData: any) {
    const res = await axiosClient.post(`/members`, memberData);
    return res.data;
  }

  static async updateMember(memberId: number, updates: any) {
    const res = await axiosClient.put(`/members/${memberId}`, updates);
    return res.data;
  }

  static async deleteMember(memberId: number) {
    await axiosClient.delete(`/members/${memberId}`);
  }

  static async uploadPhoto(memberId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post(`/members/upload-photo/${memberId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // public URL
  }

  static async generateMemberCode(gymId: number) {
    const res = await axiosClient.get(`/members/generate-code/${gymId}`);
    return res.data;
  }

  static async searchMembers(gymId: number, term: string): Promise<Member[]> {
    const res = await axiosClient.get(`/members/search`, {
      params: { gymId, term },
    });
    return res.data;
  }
}
