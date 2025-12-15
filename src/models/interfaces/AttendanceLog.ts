import { Member } from "./member";


export interface AttendanceLog {
  id: number;
  gymId: number;
  memberId: number;
  checkInAt: string;
  checkOutAt?: string | null;
  checkedInBy?: number | null;
  deviceInfo?: string | null;
  createdAt: string;

  member: Member;
}

