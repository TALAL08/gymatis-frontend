/**
 * PDF Service - Client-side PDF generation using standardized templates
 */
import { downloadReportPdf, ReportColumn, ReportSummaryItem } from '@/lib/pdf';
import { format } from 'date-fns';

export type PdfTemplateType = 
  | 'salary-slip' 
  | 'invoice' 
  | 'expense-report' 
  | 'payment-receipt' 
  | 'membership-receipt' 
  | 'report'
  | 'account-ledger'
  | 'attendance-report'
  | 'payment-collection'
  | 'income-expense'
  | 'account-summary';

// ============= Account Ledger PDF =============
export interface LedgerEntry {
  transactionDate: string;
  referenceNo?: string;
  description?: string;
  debit: number;
  credit: number;
  balance: number;
  referenceType: string;
}

export const downloadAccountLedgerPdf = (
  entries: LedgerEntry[],
  options: { accountName: string; startDate?: string; endDate?: string; currentBalance?: number }
): void => {
  const columns: ReportColumn[] = [
    { header: 'Date', key: 'date', width: 25 },
    { header: 'Reference', key: 'referenceNo', width: 25 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Debit', key: 'debit', width: 25, align: 'right' },
    { header: 'Credit', key: 'credit', width: 25, align: 'right' },
    { header: 'Balance', key: 'balance', width: 25, align: 'right' },
  ];

  const data = entries.map((entry) => ({
    date: format(new Date(entry.transactionDate), 'MMM dd, yyyy'),
    referenceNo: entry.referenceNo || '-',
    description: entry.description || '-',
    type: entry.referenceType,
    debit: entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-',
    credit: entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-',
    balance: `Rs. ${entry.balance.toLocaleString()}`,
  }));

  const summary: ReportSummaryItem[] = [
    { label: 'Account', value: options.accountName, color: 'primary' },
    { label: 'Current Balance', value: `Rs. ${(options.currentBalance || 0).toLocaleString()}`, color: 'success' },
    { label: 'Total Entries', value: entries.length.toString(), color: 'muted' },
  ];

  if (options.startDate && options.endDate) {
    summary.push({
      label: 'Period',
      value: `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`,
      color: 'muted',
    });
  }

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Account Ledger',
      subtitle: options.accountName,
      columns,
      data,
      summary,
    },
    `ledger-${options.accountName}-${dateStr}.pdf`
  );
};

// ============= Expense Report PDF =============
export interface ExpenseReportCategory {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  expenses: Array<{ id: string; date: string; description?: string; accountName: string; amount: number }>;
}

export const downloadExpenseReportPdfClient = (
  categories: ExpenseReportCategory[],
  options?: { gymName?: string; startDate?: string; endDate?: string; showDetails?: boolean }
): void => {
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);
  const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0);

  if (options?.showDetails) {
    // Detailed view - show all expenses
    const columns: ReportColumn[] = [
      { header: 'Category', key: 'category', width: 35 },
      { header: 'Date', key: 'date', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Account', key: 'account', width: 30 },
      { header: 'Amount', key: 'amount', width: 25, align: 'right' },
    ];

    const data: Record<string, any>[] = [];
    categories.forEach((cat) => {
      cat.expenses.forEach((exp) => {
        data.push({
          category: cat.categoryName,
          date: format(new Date(exp.date), 'MMM dd, yyyy'),
          description: exp.description || '-',
          account: exp.accountName,
          amount: `Rs. ${exp.amount.toLocaleString()}`,
        });
      });
    });

    const summary: ReportSummaryItem[] = [
      { label: 'Total Expenses', value: `Rs. ${totalExpenses.toLocaleString()}`, color: 'danger' },
      { label: 'Categories', value: categories.length.toString(), color: 'primary' },
      { label: 'Transactions', value: totalTransactions.toString(), color: 'muted' },
    ];

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    downloadReportPdf(
      {
        title: 'Expense Report (Detailed)',
        subtitle: options?.startDate && options?.endDate
          ? `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
          : undefined,
        gymName: options?.gymName,
        columns,
        data,
        summary,
        headerColor: [239, 68, 68], // Red for expenses
      },
      `expense-report-detailed-${dateStr}.pdf`
    );
  } else {
    // Summary view - category totals only
    const columns: ReportColumn[] = [
      { header: 'Category', key: 'category', width: 60 },
      { header: 'Transactions', key: 'transactions', width: 30, align: 'center' },
      { header: 'Total Amount', key: 'amount', width: 40, align: 'right' },
    ];

    const data = categories.map((cat) => ({
      category: cat.categoryName,
      transactions: cat.transactionCount.toString(),
      amount: `Rs. ${cat.totalAmount.toLocaleString()}`,
    }));

    const summary: ReportSummaryItem[] = [
      { label: 'Total Expenses', value: `Rs. ${totalExpenses.toLocaleString()}`, color: 'danger' },
      { label: 'Categories', value: categories.length.toString(), color: 'primary' },
      { label: 'Transactions', value: totalTransactions.toString(), color: 'muted' },
    ];

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    downloadReportPdf(
      {
        title: 'Expense Report',
        subtitle: options?.startDate && options?.endDate
          ? `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
          : undefined,
        gymName: options?.gymName,
        columns,
        data,
        summary,
        headerColor: [239, 68, 68], // Red for expenses
      },
      `expense-report-${dateStr}.pdf`
    );
  }
};

// ============= Trainer Salary Slips PDF =============
export interface SalarySlipSummary {
  trainerName: string;
  month: number;
  year: number;
  baseSalary: number;
  activeMemberCount: number;
  incentiveTotal: number;
  grossSalary: number;
  paymentStatus: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const downloadSalarySlipsReportPdf = (
  salarySlips: SalarySlipSummary[],
  options?: { year?: number; gymName?: string }
): void => {
  const totalPayout = salarySlips.reduce((sum, slip) => sum + slip.grossSalary, 0);
  const totalIncentives = salarySlips.reduce((sum, slip) => sum + slip.incentiveTotal, 0);
  const paidCount = salarySlips.filter((s) => s.paymentStatus === 'Paid').length;

  const columns: ReportColumn[] = [
    { header: 'Trainer', key: 'trainer', width: 35 },
    { header: 'Month / Year', key: 'period', width: 30 },
    { header: 'Base Salary', key: 'baseSalary', width: 25, align: 'right' },
    { header: 'Members', key: 'members', width: 20, align: 'center' },
    { header: 'Incentive', key: 'incentive', width: 25, align: 'right' },
    { header: 'Gross Salary', key: 'grossSalary', width: 25, align: 'right' },
    { header: 'Status', key: 'status', width: 20, align: 'center' },
  ];

  const data = salarySlips.map((slip) => ({
    trainer: slip.trainerName,
    period: `${MONTHS[slip.month - 1]} ${slip.year}`,
    baseSalary: `Rs. ${slip.baseSalary.toLocaleString()}`,
    members: slip.activeMemberCount.toString(),
    incentive: `Rs. ${slip.incentiveTotal.toLocaleString()}`,
    grossSalary: `Rs. ${slip.grossSalary.toLocaleString()}`,
    status: slip.paymentStatus,
  }));

  const summary: ReportSummaryItem[] = [
    { label: 'Total Payout', value: `Rs. ${totalPayout.toLocaleString()}`, color: 'primary' },
    { label: 'Total Incentives', value: `Rs. ${totalIncentives.toLocaleString()}`, color: 'success' },
    { label: 'Total Slips', value: salarySlips.length.toString(), color: 'muted' },
    { label: 'Paid', value: `${paidCount} / ${salarySlips.length}`, color: paidCount === salarySlips.length ? 'success' : 'warning' },
  ];

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Trainer Salary Slips Report',
      subtitle: options?.year ? `Year ${options.year}` : undefined,
      gymName: options?.gymName,
      columns,
      data,
      summary,
    },
    `salary-slips-report-${options?.year || dateStr}.pdf`
  );
};

// ============= Attendance Report PDF =============
export interface AttendanceRecord {
  memberCode: string;
  memberName: string;
  checkInAt: string;
  checkOutAt: string | null;
  duration: string;
}

export const downloadAttendanceReportPdf = (
  records: AttendanceRecord[],
  options?: { startDate?: string; endDate?: string; gymName?: string }
): void => {
  const columns: ReportColumn[] = [
    { header: 'Member Code', key: 'memberCode', width: 25 },
    { header: 'Name', key: 'memberName', width: 40 },
    { header: 'Check-in', key: 'checkIn', width: 35 },
    { header: 'Check-out', key: 'checkOut', width: 35 },
    { header: 'Duration', key: 'duration', width: 25 },
  ];

  const data = records.map((record) => ({
    memberCode: record.memberCode,
    memberName: record.memberName,
    checkIn: format(new Date(record.checkInAt), 'MMM dd, yyyy HH:mm'),
    checkOut: record.checkOutAt ? format(new Date(record.checkOutAt), 'MMM dd, yyyy HH:mm') : 'N/A',
    duration: record.duration,
  }));

  const summary: ReportSummaryItem[] = [
    { label: 'Total Records', value: records.length.toString(), color: 'primary' },
  ];

  if (options?.startDate && options?.endDate) {
    summary.push({
      label: 'Period',
      value: `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`,
      color: 'muted',
    });
  }

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Attendance Report',
      subtitle: options?.startDate && options?.endDate
        ? `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
        : undefined,
      gymName: options?.gymName,
      columns,
      data,
      summary,
      headerColor: [34, 197, 94], // Green
    },
    `attendance-report-${dateStr}.pdf`
  );
};

// ============= Payment Collection Report PDF =============
export interface PaymentRecord {
  invoiceNumber: string;
  memberCode: string;
  memberName: string;
  amount: number;
  discount: number;
  netAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export const downloadPaymentCollectionReportPdf = (
  records: PaymentRecord[],
  stats: { totalAmount: number; paidAmount: number; pendingAmount: number },
  options?: { startDate?: string; endDate?: string; gymName?: string }
): void => {
  const columns: ReportColumn[] = [
    { header: 'Invoice #', key: 'invoiceNumber', width: 25 },
    { header: 'Member', key: 'member', width: 35 },
    { header: 'Amount', key: 'amount', width: 22, align: 'right' },
    { header: 'Discount', key: 'discount', width: 20, align: 'right' },
    { header: 'Net Amount', key: 'netAmount', width: 22, align: 'right' },
    { header: 'Status', key: 'status', width: 20, align: 'center' },
    { header: 'Method', key: 'method', width: 20 },
    { header: 'Date', key: 'date', width: 22 },
  ];

  const data = records.map((record) => ({
    invoiceNumber: record.invoiceNumber,
    member: `${record.memberName} (${record.memberCode})`,
    amount: `Rs. ${record.amount.toLocaleString()}`,
    discount: `Rs. ${record.discount.toLocaleString()}`,
    netAmount: `Rs. ${record.netAmount.toLocaleString()}`,
    status: record.status,
    method: record.paymentMethod || 'N/A',
    date: format(new Date(record.createdAt), 'MMM dd, yyyy'),
  }));

  const summary: ReportSummaryItem[] = [
    { label: 'Total Amount', value: `Rs. ${stats.totalAmount.toLocaleString()}`, color: 'primary' },
    { label: 'Collected', value: `Rs. ${stats.paidAmount.toLocaleString()}`, color: 'success' },
    { label: 'Outstanding', value: `Rs. ${stats.pendingAmount.toLocaleString()}`, color: 'warning' },
    { label: 'Records', value: records.length.toString(), color: 'muted' },
  ];

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Payment Collection Report',
      subtitle: options?.startDate && options?.endDate
        ? `${format(new Date(options.startDate), 'MMM dd')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
        : undefined,
      gymName: options?.gymName,
      columns,
      data,
      summary,
    },
    `payment-collection-report-${dateStr}.pdf`
  );
};

// ============= Income vs Expense Report PDF =============
export interface IncomeExpenseData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export const downloadIncomeExpenseReportPdf = (
  chartData: IncomeExpenseData[],
  stats: { totalIncome: number; totalExpense: number; netProfitLoss: number },
  options?: { startDate?: string; endDate?: string; gymName?: string }
): void => {
  const columns: ReportColumn[] = [
    { header: 'Month', key: 'month', width: 40 },
    { header: 'Income', key: 'income', width: 35, align: 'right' },
    { header: 'Expense', key: 'expense', width: 35, align: 'right' },
    { header: 'Net Profit/Loss', key: 'profit', width: 40, align: 'right' },
  ];

  const data = chartData.map((item) => ({
    month: item.month,
    income: `Rs. ${item.income.toLocaleString()}`,
    expense: `Rs. ${item.expense.toLocaleString()}`,
    profit: `Rs. ${item.profit.toLocaleString()}`,
  }));

  const isProfit = stats.netProfitLoss >= 0;
  const summary: ReportSummaryItem[] = [
    { label: 'Total Income', value: `Rs. ${stats.totalIncome.toLocaleString()}`, color: 'success' },
    { label: 'Total Expenses', value: `Rs. ${stats.totalExpense.toLocaleString()}`, color: 'danger' },
    { label: isProfit ? 'Net Profit' : 'Net Loss', value: `Rs. ${Math.abs(stats.netProfitLoss).toLocaleString()}`, color: isProfit ? 'success' : 'danger' },
  ];

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Income vs Expense Report',
      subtitle: options?.startDate && options?.endDate
        ? `${format(new Date(options.startDate), 'MMM dd, yyyy')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
        : undefined,
      gymName: options?.gymName,
      columns,
      data,
      summary,
      headerColor: [59, 130, 246], // Blue
    },
    `income-expense-report-${dateStr}.pdf`
  );
};

// ============= Account Summary Report PDF =============
export interface AccountSummaryData {
  accountId: number | string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  closingBalance: number;
}

export const downloadAccountSummaryReportPdf = (
  accounts: AccountSummaryData[],
  totals: { totalOpening: number; totalCredit: number; totalDebit: number; totalClosing: number },
  options?: { startDate?: string; endDate?: string; gymName?: string }
): void => {
  const columns: ReportColumn[] = [
    { header: 'Account Name', key: 'accountName', width: 40 },
    { header: 'Type', key: 'accountType', width: 25 },
    { header: 'Opening', key: 'openingBalance', width: 25, align: 'right' },
    { header: 'Credit', key: 'totalCredit', width: 25, align: 'right' },
    { header: 'Debit', key: 'totalDebit', width: 25, align: 'right' },
    { header: 'Closing', key: 'closingBalance', width: 25, align: 'right' },
  ];

  const data = accounts.map((acc) => ({
    accountName: acc.accountName,
    accountType: acc.accountType,
    openingBalance: `Rs. ${acc.openingBalance.toLocaleString()}`,
    totalCredit: `Rs. ${acc.totalCredit.toLocaleString()}`,
    totalDebit: `Rs. ${acc.totalDebit.toLocaleString()}`,
    closingBalance: `Rs. ${acc.closingBalance.toLocaleString()}`,
  }));

  const summary: ReportSummaryItem[] = [
    { label: 'Total Opening', value: `Rs. ${totals.totalOpening.toLocaleString()}`, color: 'muted' },
    { label: 'Total Credits', value: `Rs. ${totals.totalCredit.toLocaleString()}`, color: 'success' },
    { label: 'Total Debits', value: `Rs. ${totals.totalDebit.toLocaleString()}`, color: 'danger' },
    { label: 'Total Closing', value: `Rs. ${totals.totalClosing.toLocaleString()}`, color: 'primary' },
  ];

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  downloadReportPdf(
    {
      title: 'Account Summary Report',
      subtitle: options?.startDate && options?.endDate
        ? `${format(new Date(options.startDate), 'MMM dd, yyyy')} - ${format(new Date(options.endDate), 'MMM dd, yyyy')}`
        : undefined,
      gymName: options?.gymName,
      columns,
      data,
      summary,
    },
    `account-summary-report-${dateStr}.pdf`
  );
};

// ============= Individual Salary Slip PDF =============
export const downloadSalarySlipPdf = (
  salarySlip: {
    trainer?: { firstName?: string; lastName?: string };
    month: number;
    year: number;
    paymentStatus: string;
    generatedAt: string;
    paidAt?: string;
    baseSalary: number;
    activeMemberCount: number;
    perMemberIncentive: number;
    incentiveTotal: number;
    grossSalary: number;
  },
  options?: { gymName?: string }
): void => {
  import('@/lib/pdf/templates/salary-slip-template').then(({ downloadSalarySlipPdf: downloadSlip }) => {
    downloadSlip(salarySlip, options);
  });
};
