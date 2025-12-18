export enum AccountType {
  Bank = 'bank',
  Cash = 'cash',
}

export enum AccountStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export interface Account {
  id: string;
  gymId: string;
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
