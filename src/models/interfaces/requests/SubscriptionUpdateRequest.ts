import { SubscriptionStatus } from "@/models/enums/SubscriptionStatus";
import { SubscriptionCreateRequest } from "./SubscriptionCreateRequest";


export interface SubscriptionUpdateRequest extends Partial<SubscriptionCreateRequest> {
  status: SubscriptionStatus;
}
