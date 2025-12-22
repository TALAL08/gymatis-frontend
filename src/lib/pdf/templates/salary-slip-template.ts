/**
 * Salary Slip PDF Template
 * Generates consistent, professional salary slip PDFs
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrainerSalarySlip } from '@/models/interfaces/SalarySlip';
import { PaymentStatus } from '@/models/enums/PaymentStatus';
import {
  PDF_COLORS,
  PDF_TABLE_STYLES,
  PDF_STATUS_COLORS,
  formatCurrency,
  formatPdfDate,
} from '../pdf-config';
import {
  createPdfDocument,
  addPdfHeader,
  addSectionHeader,
  addKeyValueRow,
  addHighlightBox,
  addPdfFooter,
  addDivider,
  getTableEndY,
} from '../pdf-utils';

export interface SalarySlipPdfOptions {
  gymName?: string;
  showLogo?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Generate a salary slip PDF
 */
export const generateSalarySlipPdf = (
  salarySlip: TrainerSalarySlip,
  options?: SalarySlipPdfOptions
): jsPDF => {
  const doc = createPdfDocument();
  const trainerName = `${salarySlip.trainer?.firstName || ''} ${salarySlip.trainer?.lastName || ''}`.trim();
  const monthYear = `${MONTHS[salarySlip.month - 1]} ${salarySlip.year}`;
  const isPaid = salarySlip.paymentStatus === PaymentStatus.Paid;

  // Header
  let currentY = addPdfHeader(doc, 'SALARY SLIP', monthYear, {
    gymName: options?.gymName,
  });

  // Trainer Information Section
  currentY = addSectionHeader(doc, 'Trainer Information', currentY);
  currentY = addKeyValueRow(doc, 'Name:', trainerName, currentY, { bold: true });
  currentY = addKeyValueRow(doc, 'Generated On:', formatPdfDate(salarySlip.generatedAt), currentY);
  
  if (isPaid && salarySlip.paidAt) {
    currentY = addKeyValueRow(doc, 'Paid On:', formatPdfDate(salarySlip.paidAt), currentY);
  }
  
  currentY = addKeyValueRow(
    doc,
    'Status:',
    isPaid ? 'Paid' : 'Unpaid',
    currentY,
    { 
      bold: true,
      valueColor: isPaid ? PDF_STATUS_COLORS.paid : PDF_STATUS_COLORS.unpaid,
    }
  );

  currentY += 5;
  currentY = addDivider(doc, currentY);

  // Salary Breakdown Table
  currentY = addSectionHeader(doc, 'Salary Breakdown', currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Details', 'Amount']],
    body: [
      ['Base Salary', 'Monthly fixed salary', formatCurrency(salarySlip.baseSalary)],
      ['Active Members', `${salarySlip.activeMemberCount} members`, '-'],
      ['Per Member Incentive', 'Rate per member', formatCurrency(salarySlip.perMemberIncentive)],
      [
        'Incentive Total',
        `${salarySlip.activeMemberCount} × ${formatCurrency(salarySlip.perMemberIncentive)}`,
        formatCurrency(salarySlip.incentiveTotal),
      ],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right' },
    },
  });

  currentY = getTableEndY(doc) + 10;

  // Gross Salary Highlight Box
  currentY = addHighlightBox(
    doc,
    'Gross Salary',
    formatCurrency(salarySlip.grossSalary),
    currentY,
    {
      bgColor: [219, 234, 254], // Light blue
      textColor: PDF_COLORS.primary,
    }
  );

  // Footer
  addPdfFooter(doc);

  return doc;
};

/**
 * Download salary slip PDF
 */
export const downloadSalarySlipPdf = (
  salarySlip: TrainerSalarySlip,
  options?: SalarySlipPdfOptions
): void => {
  const doc = generateSalarySlipPdf(salarySlip, options);
  const trainerName = `${salarySlip.trainer?.firstName || ''}-${salarySlip.trainer?.lastName || ''}`.trim();
  const fileName = `salary-slip-${trainerName}-${MONTHS[salarySlip.month - 1]}-${salarySlip.year}.pdf`;
  doc.save(fileName);
};
