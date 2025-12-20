export enum ReferenceType {
  Fee = 1,
  Expense = 2,
  Adjustment = 3,
}

export interface AccountTransaction {
  id: string;
  gymId: string;
  accountId: string;
  account?: {
    id: string;
    accountName: string;
    accountType: string;
  };
  transactionDate: string;
  referenceType: ReferenceType;
  referenceId?: string | null;
  referenceNo?: string | null;
  description?: string | null;
  debit: number;
  credit: number;
  balance: number;
  createdAt: string;
}

export interface AccountLedgerFilters {
  accountId: string;
  startDate?: string;
  endDate?: string;
  referenceType?: ReferenceType;
}

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  closingBalance: number;
}

export interface IncomeExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  netProfitLoss: number;
  incomeByMonth: { month: string; amount: number }[];
  expenseByMonth: { month: string; amount: number }[];
}

export interface ExpenseReportItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  expenses: {
    id: string;
    date: string;
    description: string;
    amount: number;
    accountName: string;
  }[];
}
