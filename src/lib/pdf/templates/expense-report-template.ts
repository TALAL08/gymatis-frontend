/**
 * Expense Report PDF Template
 * Generates consistent, professional expense report PDFs
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_TABLE_STYLES,
  formatCurrency,
  formatPdfDate,
  formatShortDate,
} from '../pdf-config';
import {
  createPdfDocument,
  addPdfHeader,
  addSectionHeader,
  addHighlightBox,
  addPdfFooter,
  addDivider,
  getTableEndY,
  ensureSpace,
  PDF_LAYOUT,
} from '../pdf-utils';

export interface ExpenseReportCategory {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  expenses: Array<{
    id: string;
    date: string;
    description?: string;
    accountName: string;
    amount: number;
  }>;
}

export interface ExpenseReportPdfOptions {
  gymName?: string;
  startDate?: string;
  endDate?: string;
  showDetails?: boolean;
}

/**
 * Generate an expense report PDF
 */
export const generateExpenseReportPdf = (
  categories: ExpenseReportCategory[],
  options?: ExpenseReportPdfOptions
): jsPDF => {
  const doc = createPdfDocument();

  // Calculate totals
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);
  const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0);

  // Build subtitle
  let subtitle = 'Expense Report';
  if (options?.startDate && options?.endDate) {
    subtitle = `${formatShortDate(options.startDate)} - ${formatShortDate(options.endDate)}`;
  } else if (options?.startDate) {
    subtitle = `From ${formatShortDate(options.startDate)}`;
  } else if (options?.endDate) {
    subtitle = `Until ${formatShortDate(options.endDate)}`;
  }

  // Header
  let currentY = addPdfHeader(doc, 'EXPENSE REPORT', subtitle, {
    gymName: options?.gymName,
  });

  // Summary Section
  const summaryData = [
    ['Total Categories', categories.length.toString()],
    ['Total Transactions', totalTransactions.toString()],
    ['Total Expenses', formatCurrency(totalExpenses)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: PDF_COLORS.muted, cellWidth: 60 },
      1: { fontStyle: 'bold', textColor: PDF_COLORS.dark },
    },
  });

  currentY = getTableEndY(doc) + 10;

  // Total Highlight Box
  currentY = addHighlightBox(
    doc,
    'Total Expenses',
    formatCurrency(totalExpenses),
    currentY,
    {
      bgColor: [254, 226, 226], // Light red
      textColor: PDF_COLORS.danger,
    }
  );

  currentY = addDivider(doc, currentY);

  // Category Breakdown
  currentY = addSectionHeader(doc, 'Breakdown by Category', currentY);

  const categoryTableData = categories.map((cat) => [
    cat.categoryName,
    cat.transactionCount.toString(),
    formatCurrency(cat.totalAmount),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Category', 'Transactions', 'Amount']],
    body: categoryTableData,
    ...PDF_TABLE_STYLES,
    headStyles: {
      ...PDF_TABLE_STYLES.headStyles,
      fillColor: PDF_COLORS.danger,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 60, halign: 'right' },
    },
    foot: [['Total', totalTransactions.toString(), formatCurrency(totalExpenses)]],
    footStyles: {
      fillColor: PDF_COLORS.light,
      textColor: PDF_COLORS.dark,
      fontStyle: 'bold',
    },
  });

  currentY = getTableEndY(doc) + 15;

  // Detailed breakdown if requested
  if (options?.showDetails) {
    for (const category of categories) {
      currentY = ensureSpace(doc, currentY, 50);
      
      currentY = addSectionHeader(doc, category.categoryName, currentY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text(
        `${category.transactionCount} transactions • Total: ${formatCurrency(category.totalAmount)}`,
        PDF_LAYOUT.margins.left,
        currentY
      );
      currentY += 8;

      if (category.expenses.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Description', 'Account', 'Amount']],
          body: category.expenses.map((exp) => [
            formatShortDate(exp.date),
            exp.description || '-',
            exp.accountName,
            formatCurrency(exp.amount),
          ]),
          ...PDF_TABLE_STYLES,
          headStyles: {
            ...PDF_TABLE_STYLES.headStyles,
            fillColor: PDF_COLORS.secondary,
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40 },
            3: { cellWidth: 35, halign: 'right' },
          },
        });

        currentY = getTableEndY(doc) + 10;
      }
    }
  }

  // Footer
  addPdfFooter(doc, `Generated on ${formatPdfDate(new Date())}`);

  return doc;
};

/**
 * Download expense report PDF
 */
export const downloadExpenseReportPdf = (
  categories: ExpenseReportCategory[],
  options?: ExpenseReportPdfOptions
): void => {
  const doc = generateExpenseReportPdf(categories, options);
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `expense-report-${dateStr}.pdf`;
  doc.save(fileName);
};
