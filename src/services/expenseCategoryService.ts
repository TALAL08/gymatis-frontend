import {
  ExpenseCategory,
  ExpenseCategoryCreateRequest,
  ExpenseCategoryUpdateRequest,
} from '@/models/interfaces/Expense';
import axiosClient from '@/utils/axios-client';

export class ExpenseCategoryService {
  // ==================== EXPENSE CATEGORIES ====================

  static async getActiveCategories(gymId: number): Promise<ExpenseCategory[]> {
    const response = await axiosClient.get(`/expense-categories/active/${gymId}`);
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
   * Get all expense categories for a gym
   */
  static async getCategoriesByGym(gymId: string): Promise<ExpenseCategory[]> {
    const res = await axiosClient.get(`/expense-categories/gym/${gymId}`);
    return res.data as ExpenseCategory[];
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

}
