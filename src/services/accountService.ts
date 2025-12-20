import { Account, AccountCreateRequest, AccountUpdateRequest } from '@/models/interfaces/Account';
import { AccountTransaction, AccountLedgerFilters, AccountSummary } from '@/models/interfaces/AccountTransaction';
import { PaginatedResponse, PaginationParams } from '@/models/interfaces/PaginatedResponse';
import axiosClient from '@/utils/axios-client';

export class AccountService {
  /**
   * Get all accounts for a gym
   */
  static async getAccountsByGym(gymId: string): Promise<Account[]> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}`);
    return res.data as Account[];
  }

  /**
   * Get paginated accounts for a gym
   */
  static async getAccountsByGymPaginated(
    gymId: number,
    params: PaginationParams
  ): Promise<PaginatedResponse<Account>> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}/paginated`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        searchText: params.searchText || '',
      },
    });
    return res.data as PaginatedResponse<Account>;
  }

  /**
   * Get active accounts for a gym (for dropdowns)
   */
  static async getActiveAccounts(gymId: number): Promise<Account[]> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}/active`);
    return res.data as Account[];
  }

  /**
   * Get bank accounts only
   */
  static async getBankAccounts(gymId: number): Promise<Account[]> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}/bank`);
    return res.data as Account[];
  }

  /**
   * Get default cash account
   */
  static async getDefaultCashAccount(gymId: number): Promise<Account | null> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}/default-cash`);
    return res.data as Account | null;
  }

  /**
   * Get a single account by ID
   */
  static async getAccountById(id: string): Promise<Account> {
    const res = await axiosClient.get(`/accounts/${id}`);
    return res.data as Account;
  }

  /**
   * Create a new account
   */
  static async createAccount(data: AccountCreateRequest): Promise<Account> {
    const res = await axiosClient.post('/accounts', data);
    return res.data as Account;
  }

  /**
   * Update an account
   */
  static async updateAccount(id: number, data: AccountUpdateRequest): Promise<Account> {
    const res = await axiosClient.patch(`/accounts/${id}`, data);
    return res.data as Account;
  }

  /**
   * Deactivate an account (soft delete)
   */
  static async deactivateAccount(id: number): Promise<void> {
    await axiosClient.patch(`/accounts/${id}/deactivate`);
  }

  /**
   * Get account ledger (transactions)
   */
  static async getAccountLedger(
    filters: AccountLedgerFilters,
    params: PaginationParams
  ): Promise<PaginatedResponse<AccountTransaction>> {
    const res = await axiosClient.get(`/accounts/${filters.accountId}/ledger`, {
      params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        referenceType: filters.referenceType || '',
      },
    });
    return res.data as PaginatedResponse<AccountTransaction>;
  }

  /**
   * Get account summary report
   */
  static async getAccountSummaryReport(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<AccountSummary[]> {
    const res = await axiosClient.get(`/accounts/gym/${gymId}/summary`, {
      params: { startDate, endDate },
    });
    return res.data as AccountSummary[];
  }

  /**
   * Export account ledger to CSV
   */
  static async exportLedgerCsv(filters: AccountLedgerFilters): Promise<Blob> {
    const res = await axiosClient.get(`/accounts/${filters.accountId}/ledger/export/csv`, {
      params: {
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        referenceType: filters.referenceType || '',
      },
      responseType: 'blob',
    });
    return res.data;
  }

  /**
   * Export account ledger to PDF
   */
  static async exportLedgerPdf(filters: AccountLedgerFilters): Promise<Blob> {
    const res = await axiosClient.get(`/accounts/${filters.accountId}/ledger/export/pdf`, {
      params: {
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        referenceType: filters.referenceType || '',
      },
      responseType: 'blob',
    });
    return res.data;
  }
}
