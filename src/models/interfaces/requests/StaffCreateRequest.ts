




export interface StaffCreateRequest {
  gymId: number;
  firstName: string;
  lastName: string;
  cnic?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email: string;
  password: string;
}
