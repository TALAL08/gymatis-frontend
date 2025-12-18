import {
  Expense,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  ExpenseCategory,
  ExpenseCategoryCreateRequest,
  ExpenseCategoryUpdateRequest,
} from '@/models/interfaces/Expense';
import { ExpenseReportItem, IncomeExpenseSummary } from '@/models/interfaces/AccountTransaction';
import { PaginatedResponse, PaginationParams } from '@/models/interfaces/PaginatedResponse';
import axiosClient from '@/utils/axios-client';

export class ExpenseService {
  // ==================== EXPENSE CATEGORIES ====================

  /**
   * Get all expense categories for a gym
   */
  static async getCategoriesByGym(gymId: string): Promise<ExpenseCategory[]> {
    const res = await axiosClient.get(`/expense-categories/gym/${gymId}`);
    return res.data as ExpenseCategory[];
  }
  static async getActiveCategories(gymId: number): Promise<ExpenseCategory[]> {
    const response = await axiosClient.get(`/expenses/categories/active/${gymId}`);
    return response.data;
  }

  /**
   * Create a new expense category
   */
  static async createCategory(data: ExpenseCategoryCreateRequest): Promise<ExpenseCategory> {
    const res = await axiosClient.post('/expense-categories', data);
    return res.data as ExpenseCategory;
  }

  /**
   * Update an expense category
   */
  static async updateCategory(id: string, data: ExpenseCategoryUpdateRequest): Promise<ExpenseCategory> {
    const res = await axiosClient.patch(`/expense-categories/${id}`, data);
    return res.data as ExpenseCategory;
  }

  /**
   * Delete an expense category
   */
  static async deleteCategory(id: string): Promise<void> {
    await axiosClient.delete(`/expense-categories/${id}`);
  }

  // ==================== EXPENSES ====================

  /**
   * Get paginated expenses for a gym
   */
  static async getExpensesByGymPaginated(
    gymId: number,
    params: PaginationParams & {
      startDate?: string;
      endDate?: string;
      categoryId?: string;
      accountId?: string;
    }
  ): Promise<PaginatedResponse<Expense>> {
    const res = await axiosClient.get(`/expenses/gym/${gymId}`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        searchText: params.searchText || '',
        startDate: params.startDate || '',
        endDate: params.endDate || '',
        categoryId: params.categoryId || '',
        accountId: params.accountId || '',
      },
    });
    return res.data as PaginatedResponse<Expense>;
  }

  /**
   * Get a single expense by ID
   */
  static async getExpenseById(id: string): Promise<Expense> {
    const res = await axiosClient.get(`/expenses/${id}`);
    return res.data as Expense;
  }
  /**
   * Create a new expense
   */
  static async createExpense(data: ExpenseCreateRequest): Promise<Expense> {
    const res = await axiosClient.post('/expenses', data);
    return res.data as Expense;
  }

  /**
   * Update an expense
   */
  static async updateExpense(id: string, data: ExpenseUpdateRequest): Promise<Expense> {
    const res = await axiosClient.patch(`/expenses/${id}`, data);
    return res.data as Expense;
  }

  /**
   * Delete an expense
   */
  static async deleteExpense(id: string): Promise<void> {
    await axiosClient.delete(`/expenses/${id}`);
  }

  // ==================== REPORTS ====================

  /**
   * Get expense report by category
   */
  static async getExpenseReport(
    gymId: number,
    startDate?: string,
    endDate?: string,
    categoryId?: string,
    accountId?: string
  ): Promise<ExpenseReportItem[]> {
    const res = await axiosClient.get(`/expenses/gym/${gymId}/report`, {
      params: { startDate, endDate, categoryId, accountId },
    });
    return res.data as ExpenseReportItem[];
  }

  /**
   * Get income vs expense summary
   */
  static async getIncomeExpenseSummary(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<IncomeExpenseSummary> {
    const res = await axiosClient.get(`/reports/gym/${gymId}/income-expense`, {
      params: { startDate, endDate },
    });
    return res.data as IncomeExpenseSummary;
  }

  /**
   * Export expense report to CSV
   */
  static async exportExpenseReportCsv(
    gymId: number,
    startDate?: string,
    endDate?: string,
    categoryId?: string,
    accountId?: string
  ): Promise<Blob> {
    const res = await axiosClient.get(`/expenses/gym/${gymId}/export/csv`, {
      params: { startDate, endDate, categoryId, accountId },
      responseType: 'blob',
    });
    return res.data;
  }

  /**
   * Export expense report to PDF
   */
  static async exportExpenseReportPdf(
    gymId: number,
    startDate?: string,
    endDate?: string,
    categoryId?: string,
    accountId?: string
  ): Promise<Blob> {
    const res = await axiosClient.get(`/expenses/gym/${gymId}/export/pdf`, {
      params: { startDate, endDate, categoryId, accountId },
      responseType: 'blob',
    });
    return res.data;
  }

  /**
   * Export income vs expense report to CSV
   */
  static async exportIncomeExpenseCsv(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const res = await axiosClient.get(`/reports/gym/${gymId}/income-expense/export/csv`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return res.data;
  }

  /**
   * Export income vs expense report to PDF
   */
  static async exportIncomeExpensePdf(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const res = await axiosClient.get(`/reports/gym/${gymId}/income-expense/export/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return res.data;
  }
}
