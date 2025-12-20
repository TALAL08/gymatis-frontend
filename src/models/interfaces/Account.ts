export enum AccountType {
  Bank = 1,
  Cash = 2
}

export enum AccountStatus {
  Active = 1,
  Inactive = 2,
}

export interface Account {
  id: number;
  gymId: number;
  accountName: string;
  accountType: AccountType;
  bankName?: string | null;
  openingBalance: number;
  currentBalance: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountCreateRequest {
  gymId: string;
  accountName: string;
  accountType: AccountType;
  bankName?: string | null;
  openingBalance: number;
}

export interface AccountUpdateRequest {
  accountName?: string;
  bankName?: string | null;
  isActive?: boolean;
}
