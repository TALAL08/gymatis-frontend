import { TransactionCreate } from "@/models/interfaces/requests/TransactionCreate";
import { TransactionUpdate } from "@/models/interfaces/requests/TransactionUpdate";
import { Transaction } from "@/models/interfaces/Transaction";
import axiosClient from "@/utils/axios-client";

export class TransactionService {
  /**
   * Get all transactions for a gym
   */
  static async getTransactionsByGym(gymId: number): Promise<Transaction[]> {
    const res = await axiosClient.get(`/transactions/gym/${gymId}`);
    return res.data as Transaction[];
  }

  /**
   * Get transactions by invoice
   */
  static async getTransactionsByInvoice(invoiceId: number): Promise<Transaction[]> {
    const res = await axiosClient.get(`/transactions/invoice/${invoiceId}`);
    return res.data as Transaction[];
  }

  /**
   * Get a single transaction
   */
  static async getTransactionById(id: number): Promise<Transaction> {
    const res = await axiosClient.get(`/transactions/${id}`);
    return res.data as Transaction;
  }

  /**
   * Get a total revenue 
   */
  static async getTotalRevenue(gymId: number, month: number, year: number): Promise<number> {
    const res = await axiosClient.get<number>(`/transactions/getTotalRevenue/${gymId}/${month}/${year}`);
    return res.data;
  }
  /**
   * Create a transaction
   */
  static async createTransaction(
    data: TransactionCreate
  ): Promise<Transaction> {
    const res = await axiosClient.post("/transactions", data);
    return res.data as Transaction;
  }

  /**
   * Update a transaction (PATCH)
   */
  static async updateTransaction(
    id: number,
    updates: TransactionUpdate
  ): Promise<Transaction> {
    const res = await axiosClient.patch(`/transactions/${id}`, updates);
    return res.data as Transaction;
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(id: number): Promise<void> {
    await axiosClient.delete(`/transactions/${id}`);
  }

  /**
   * Get transactions by date range
   */
  static async getTransactionsByDateRange(
    gymId: number,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    const res = await axiosClient.get(
      `/transactions/gym/${gymId}/range?start=${startDate}&end=${endDate}`
    );
    return res.data as Transaction[];
  }
}
