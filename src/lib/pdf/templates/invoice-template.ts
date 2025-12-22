/**
 * Invoice PDF Template
 * Generates consistent, professional invoice PDFs
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  paidAt?: string;
  member: {
    name: string;
    phone?: string;
    email?: string;
    memberCode?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
}

export interface InvoicePdfOptions {
  gymName?: string;
  gymAddress?: string;
  gymPhone?: string;
  gymEmail?: string;
  showLogo?: boolean;
}

/**
 * Generate an invoice PDF
 */
export const generateInvoicePdf = (
  invoice: InvoiceData,
  options?: InvoicePdfOptions
): jsPDF => {
  const doc = createPdfDocument();
  const isPaid = invoice.status.toLowerCase() === 'paid';
  const statusColor = PDF_STATUS_COLORS[invoice.status.toLowerCase() as keyof typeof PDF_STATUS_COLORS] || PDF_COLORS.muted;

  // Header
  let currentY = addPdfHeader(doc, 'INVOICE', `#${invoice.invoiceNumber}`, {
    gymName: options?.gymName,
  });

  // Two-column layout for invoice info and member info
  const colWidth = 85;
  const col1X = 14;
  const col2X = 110;

  // Invoice Details (Left Column)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text('Invoice Details', col1X, currentY);

  currentY += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Invoice Date:', col1X, currentY);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(formatPdfDate(invoice.invoiceDate), col1X + 30, currentY);

  currentY += 6;
  if (invoice.dueDate) {
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Due Date:', col1X, currentY);
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(formatPdfDate(invoice.dueDate), col1X + 30, currentY);
    currentY += 6;
  }

  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Status:', col1X, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...statusColor);
  doc.text(invoice.status.toUpperCase(), col1X + 30, currentY);

  if (isPaid && invoice.paidAt) {
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Paid On:', col1X, currentY);
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(formatPdfDate(invoice.paidAt), col1X + 30, currentY);
  }

  // Member Details (Right Column)
  let memberY = currentY - (invoice.dueDate ? 19 : 13) - (isPaid && invoice.paidAt ? 0 : 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text('Bill To', col2X, memberY);

  memberY += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.member.name, col2X, memberY);

  if (invoice.member.memberCode) {
    memberY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`Member ID: ${invoice.member.memberCode}`, col2X, memberY);
  }

  if (invoice.member.phone) {
    memberY += 5;
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(invoice.member.phone, col2X, memberY);
  }

  if (invoice.member.email) {
    memberY += 5;
    doc.text(invoice.member.email, col2X, memberY);
  }

  currentY = Math.max(currentY, memberY) + 15;
  currentY = addDivider(doc, currentY);

  // Items Table
  currentY = addSectionHeader(doc, 'Items', currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    ...PDF_TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  currentY = getTableEndY(doc) + 10;

  // Summary
  const summaryX = 120;
  const valueX = 180;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Subtotal:', summaryX, currentY);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(formatCurrency(invoice.subtotal), valueX, currentY, { align: 'right' });

  if (invoice.discount && invoice.discount > 0) {
    currentY += 6;
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Discount:', summaryX, currentY);
    doc.setTextColor(...PDF_COLORS.danger);
    doc.text(`-${formatCurrency(invoice.discount)}`, valueX, currentY, { align: 'right' });
  }

  if (invoice.tax && invoice.tax > 0) {
    currentY += 6;
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Tax:', summaryX, currentY);
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(formatCurrency(invoice.tax), valueX, currentY, { align: 'right' });
  }

  currentY += 10;

  // Total Box
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(summaryX - 5, currentY - 4, 75, 14, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Total:', summaryX, currentY + 5);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(formatCurrency(invoice.total), valueX, currentY + 5, { align: 'right' });

  currentY += 20;

  // Payment Method
  if (invoice.paymentMethod) {
    currentY += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text('Payment Method:', 14, currentY);
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(invoice.paymentMethod, 50, currentY);
  }

  // Notes
  if (invoice.notes) {
    currentY += 15;
    currentY = addSectionHeader(doc, 'Notes', currentY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.dark);
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
    doc.text(splitNotes, 14, currentY);
  }

  // Footer
  addPdfFooter(doc, 'Thank you for your business!');

  return doc;
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePdf = (
  invoice: InvoiceData,
  options?: InvoicePdfOptions
): void => {
  const doc = generateInvoicePdf(invoice, options);
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
  doc.save(fileName);
};
