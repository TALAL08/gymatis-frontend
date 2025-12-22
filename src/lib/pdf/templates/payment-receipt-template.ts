/**
 * Payment Receipt PDF Template
 * Generates consistent, professional payment receipt PDFs
 */
import { jsPDF } from 'jspdf';
import {
  PDF_COLORS,
  PDF_FONTS,
  formatCurrency,
  formatPdfDate,
} from '../pdf-config';
import {
  createPdfDocument,
  addPdfHeader,
  addKeyValueRow,
  addHighlightBox,
  addPdfFooter,
  addDivider,
  PDF_LAYOUT,
} from '../pdf-utils';

export interface PaymentReceiptData {
  receiptNumber: string;
  paymentDate: string;
  member: {
    name: string;
    memberCode?: string;
    phone?: string;
  };
  invoiceNumber?: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  accountName?: string;
  notes?: string;
}

export interface PaymentReceiptPdfOptions {
  gymName?: string;
  gymAddress?: string;
  gymPhone?: string;
}

/**
 * Generate a payment receipt PDF
 */
export const generatePaymentReceiptPdf = (
  receipt: PaymentReceiptData,
  options?: PaymentReceiptPdfOptions
): jsPDF => {
  const doc = createPdfDocument();

  // Header
  let currentY = addPdfHeader(doc, 'PAYMENT RECEIPT', `#${receipt.receiptNumber}`, {
    gymName: options?.gymName,
  });

  // Receipt Info
  currentY = addKeyValueRow(doc, 'Receipt Date:', formatPdfDate(receipt.paymentDate), currentY);
  if (receipt.invoiceNumber) {
    currentY = addKeyValueRow(doc, 'Invoice Number:', receipt.invoiceNumber, currentY);
  }
  
  currentY += 5;
  currentY = addDivider(doc, currentY);

  // Member Info Section
  doc.setFontSize(PDF_FONTS.sizes.heading);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text('Received From', PDF_LAYOUT.margins.left, currentY);
  currentY += 8;

  doc.setFontSize(PDF_FONTS.sizes.body);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.text(receipt.member.name, PDF_LAYOUT.margins.left, currentY);
  currentY += 6;

  if (receipt.member.memberCode) {
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`Member ID: ${receipt.member.memberCode}`, PDF_LAYOUT.margins.left, currentY);
    currentY += 6;
  }

  if (receipt.member.phone) {
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(receipt.member.phone, PDF_LAYOUT.margins.left, currentY);
    currentY += 6;
  }

  currentY += 5;
  currentY = addDivider(doc, currentY);

  // Payment Details Section
  doc.setFontSize(PDF_FONTS.sizes.heading);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text('Payment Details', PDF_LAYOUT.margins.left, currentY);
  currentY += 10;

  currentY = addKeyValueRow(doc, 'Payment Method:', receipt.paymentMethod, currentY);
  
  if (receipt.accountName) {
    currentY = addKeyValueRow(doc, 'Account:', receipt.accountName, currentY);
  }
  
  if (receipt.referenceNumber) {
    currentY = addKeyValueRow(doc, 'Reference Number:', receipt.referenceNumber, currentY);
  }

  currentY += 10;

  // Amount Box
  currentY = addHighlightBox(
    doc,
    'Amount Received',
    formatCurrency(receipt.amount),
    currentY,
    {
      bgColor: [220, 252, 231], // Light green
      textColor: PDF_COLORS.success,
    }
  );

  // Notes
  if (receipt.notes) {
    currentY += 10;
    doc.setFontSize(PDF_FONTS.sizes.heading);
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text('Notes', PDF_LAYOUT.margins.left, currentY);
    currentY += 7;
    
    doc.setFontSize(PDF_FONTS.sizes.body);
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
    const splitNotes = doc.splitTextToSize(receipt.notes, PDF_LAYOUT.contentWidth);
    doc.text(splitNotes, PDF_LAYOUT.margins.left, currentY);
  }

  // Footer
  addPdfFooter(doc, 'Thank you for your payment!');

  return doc;
};

/**
 * Download payment receipt PDF
 */
export const downloadPaymentReceiptPdf = (
  receipt: PaymentReceiptData,
  options?: PaymentReceiptPdfOptions
): void => {
  const doc = generatePaymentReceiptPdf(receipt, options);
  const fileName = `receipt-${receipt.receiptNumber}.pdf`;
  doc.save(fileName);
};
