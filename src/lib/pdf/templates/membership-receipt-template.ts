/**
 * Membership Receipt PDF Template
 * Generates consistent, professional membership receipt PDFs
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_TABLE_STYLES,
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
  PDF_LAYOUT,
} from '../pdf-utils';

export interface MembershipReceiptData {
  receiptNumber: string;
  receiptDate: string;
  member: {
    name: string;
    memberCode: string;
    phone?: string;
    email?: string;
  };
  package: {
    name: string;
    duration: string;
    price: number;
  };
  subscription: {
    startDate: string;
    endDate: string;
  };
  trainer?: {
    name: string;
    addonPrice: number;
  };
  discount?: number;
  totalPaid: number;
  paymentMethod: string;
  notes?: string;
}

export interface MembershipReceiptPdfOptions {
  gymName?: string;
  gymAddress?: string;
  gymPhone?: string;
}

/**
 * Generate a membership receipt PDF
 */
export const generateMembershipReceiptPdf = (
  receipt: MembershipReceiptData,
  options?: MembershipReceiptPdfOptions
): jsPDF => {
  const doc = createPdfDocument();

  // Header
  let currentY = addPdfHeader(doc, 'MEMBERSHIP RECEIPT', `#${receipt.receiptNumber}`, {
    gymName: options?.gymName,
  });

  // Receipt Info
  currentY = addKeyValueRow(doc, 'Receipt Date:', formatPdfDate(receipt.receiptDate), currentY);
  
  currentY += 5;
  currentY = addDivider(doc, currentY);

  // Member Info Section
  currentY = addSectionHeader(doc, 'Member Information', currentY);
  currentY = addKeyValueRow(doc, 'Name:', receipt.member.name, currentY, { bold: true });
  currentY = addKeyValueRow(doc, 'Member ID:', receipt.member.memberCode, currentY);
  if (receipt.member.phone) {
    currentY = addKeyValueRow(doc, 'Phone:', receipt.member.phone, currentY);
  }
  if (receipt.member.email) {
    currentY = addKeyValueRow(doc, 'Email:', receipt.member.email, currentY);
  }

  currentY += 5;
  currentY = addDivider(doc, currentY);

  // Package Details Section
  currentY = addSectionHeader(doc, 'Package Details', currentY);

  const packageItems: string[][] = [
    ['Package Name', receipt.package.name, formatCurrency(receipt.package.price)],
    ['Duration', receipt.package.duration, '-'],
    ['Start Date', formatPdfDate(receipt.subscription.startDate), '-'],
    ['End Date', formatPdfDate(receipt.subscription.endDate), '-'],
  ];

  if (receipt.trainer) {
    packageItems.push(['Personal Trainer', receipt.trainer.name, formatCurrency(receipt.trainer.addonPrice)]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Details', 'Amount']],
    body: packageItems,
    ...PDF_TABLE_STYLES,
    headStyles: {
      ...PDF_TABLE_STYLES.headStyles,
      fillColor: PDF_COLORS.success,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right' },
    },
  });

  currentY = getTableEndY(doc) + 10;

  // Payment Summary
  const summaryX = 120;
  const valueX = 180;

  let subtotal = receipt.package.price + (receipt.trainer?.addonPrice || 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Subtotal:', summaryX, currentY);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(formatCurrency(subtotal), valueX, currentY, { align: 'right' });

  if (receipt.discount && receipt.discount > 0) {
    currentY += 6;
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Discount:', summaryX, currentY);
    doc.setTextColor(...PDF_COLORS.danger);
    doc.text(`-${formatCurrency(receipt.discount)}`, valueX, currentY, { align: 'right' });
  }

  currentY += 10;

  // Total Paid Box
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(summaryX - 5, currentY - 4, 75, 14, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Total Paid:', summaryX, currentY + 5);
  doc.setTextColor(...PDF_COLORS.success);
  doc.text(formatCurrency(receipt.totalPaid), valueX, currentY + 5, { align: 'right' });

  currentY += 25;

  // Payment Method
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Payment Method:', PDF_LAYOUT.margins.left, currentY);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(receipt.paymentMethod, PDF_LAYOUT.margins.left + 40, currentY);

  // Notes
  if (receipt.notes) {
    currentY += 15;
    currentY = addSectionHeader(doc, 'Notes', currentY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.dark);
    const splitNotes = doc.splitTextToSize(receipt.notes, PDF_LAYOUT.contentWidth);
    doc.text(splitNotes, PDF_LAYOUT.margins.left, currentY);
  }

  // Footer
  addPdfFooter(doc, 'Welcome to our gym! Stay fit and healthy.');

  return doc;
};

/**
 * Download membership receipt PDF
 */
export const downloadMembershipReceiptPdf = (
  receipt: MembershipReceiptData,
  options?: MembershipReceiptPdfOptions
): void => {
  const doc = generateMembershipReceiptPdf(receipt, options);
  const fileName = `membership-receipt-${receipt.receiptNumber}.pdf`;
  doc.save(fileName);
};
