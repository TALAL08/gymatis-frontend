import { TrainerCreateRequest } from "./TrainerCreateRequest";


export interface TrainerUpdateRequest extends Partial<TrainerCreateRequest> {
    isActive?: boolean;
}
