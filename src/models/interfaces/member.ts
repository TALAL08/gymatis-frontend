import { Gender } from "../enums/Gender";
import { MemberStatus } from "../enums/MemberStatus";
import { ApplicationUser } from "./ApplicationUser";
import { Gym } from "./Gym";
import { Subscription } from "./Subscription";

export interface Member {
  id: number;
  gymId: number;
  userId: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  cnic?: string | null;
  dateOfBirth?: string | null; // DateOnly → string (YYYY-MM-DD)
  gender: Gender;

  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  photoUrl?: string | null;
  status: MemberStatus;
  notes?: string | null;

  joinedAt: string;   // DateTime → string
  createdAt: string;  // DateTime → string
  updatedAt: string;  // DateTime → string

  subscriptions:Subscription[]
  gym: Gym;
  user: ApplicationUser;
}