export interface ExpenseCategory {
  id: string;
  gymId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  gymId: string;
  expenseDate: string;
  categoryId: string;
  category?: ExpenseCategory;
  description?: string | null;
  amount: number;
  accountId: string;
  account?: {
    id: string;
    accountName: string;
    accountType: string;
  };
  referenceNumber?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreateRequest {
  gymId: string;
  expenseDate: string;
  categoryId: string;
  description?: string | null;
  amount: number;
  accountId: string;
  referenceNumber?: string | null;
}

export interface ExpenseUpdateRequest {
  expenseDate?: string;
  categoryId?: string;
  description?: string | null;
  amount?: number;
  accountId?: string;
  referenceNumber?: string | null;
}

export interface ExpenseCategoryCreateRequest {
  gymId: string;
  name: string;
  description?: string | null;
}

export interface ExpenseCategoryUpdateRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
