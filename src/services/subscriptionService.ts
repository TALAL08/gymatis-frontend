import { SubscriptionCreateRequest } from "@/models/interfaces/requests/SubscriptionCreateRequest";
import { SubscriptionUpdateRequest } from "@/models/interfaces/requests/SubscriptionUpdateRequest";
import { Subscription } from "@/models/interfaces/Subscription";
import axiosClient from "@/utils/axios-client";


export class SubscriptionService {
  static async getSubscriptionsByGym(gymId: number): Promise<Subscription[]> {
    const res = await axiosClient.get(`/memberSubscriptions/gym/${gymId}`);
    return res.data;
  }

  static async getSubscriptionsByMember(memberId: number): Promise<Subscription[]> {
    const res = await axiosClient.get(`/memberSubscriptions/member/${memberId}`);
    return res.data;
  }

  static async getSubscriptionById(id: number): Promise<Subscription> {
    const res = await axiosClient.get(`/memberSubscriptions/${id}`);
    return res.data;
  }

  static async getActiveSubscription(memberId: number): Promise<Subscription | null> {
    const res = await axiosClient.get(`/memberSubscriptions/member/${memberId}/active`);
    return res.data;
  }

  static async createSubscription(
    payload: SubscriptionCreateRequest
  ): Promise<Subscription> {
    const res = await axiosClient.post(`/memberSubscriptions`, payload);
    return res.data;
  }

  static async updateSubscription(
    id: number,
    payload: SubscriptionUpdateRequest
  ): Promise<Subscription> {
    const res = await axiosClient.put(`/memberSubscriptions/${id}`, payload);
    return res.data;
  }

  static async cancelSubscription(id: number): Promise<void> {
    await axiosClient.patch(`/memberSubscriptions/${id}/cancel`);
  }

  static async renewSubscription(
    oldId: number,
    payload: SubscriptionCreateRequest
  ): Promise<Subscription> {
    const res = await axiosClient.post(`/memberSubscriptions/renew/${oldId}`, payload);
    return res.data;
  }
}
