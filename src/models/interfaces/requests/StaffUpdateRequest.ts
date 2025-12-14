




export interface StaffUpdateRequest {
  gymId: number;
  firstName: string;
  lastName: string;
  email: string;
  cnic?: string | null;
  phone?: string | null;
  password: string | null;
}

