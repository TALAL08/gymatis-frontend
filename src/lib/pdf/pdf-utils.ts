/**
 * Utility functions for PDF generation using jsPDF
 */
import { jsPDF } from 'jspdf';
import { PDF_COLORS, PDF_FONTS, PDF_LAYOUT } from './pdf-config';

export { PDF_LAYOUT };

export interface PDFDocumentOptions {
  title?: string;
  subtitle?: string;
  showFooter?: boolean;
  footerText?: string;
}

/**
 * Create a new PDF document with standard configuration
 */
export const createPdfDocument = (): jsPDF => {
  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
};

/**
 * Add a standard header to the PDF
 */
export const addPdfHeader = (
  doc: jsPDF,
  title: string,
  subtitle?: string,
  options?: { logoUrl?: string; gymName?: string }
): number => {
  let currentY = PDF_LAYOUT.margins.top;

  // Title
  doc.setFontSize(PDF_FONTS.sizes.title);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(title, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
  currentY += 8;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(PDF_FONTS.sizes.subheading);
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(subtitle, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 6;
  }

  // Gym name if provided
  if (options?.gymName) {
    doc.setFontSize(PDF_FONTS.sizes.body);
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(options.gymName, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 6;
  }

  // Divider line
  currentY += 5;
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PDF_LAYOUT.margins.left, currentY, doc.internal.pageSize.width - PDF_LAYOUT.margins.right, currentY);
  currentY += 10;

  return currentY;
};

/**
 * Add a section header
 */
export const addSectionHeader = (doc: jsPDF, title: string, y: number): number => {
  doc.setFontSize(PDF_FONTS.sizes.heading);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(title, PDF_LAYOUT.margins.left, y);
  return y + PDF_LAYOUT.lineHeight + 2;
};

/**
 * Add a key-value pair row
 */
export const addKeyValueRow = (
  doc: jsPDF,
  key: string,
  value: string,
  y: number,
  options?: { bold?: boolean; valueColor?: [number, number, number] }
): number => {
  doc.setFontSize(PDF_FONTS.sizes.body);
  
  // Key
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(key, PDF_LAYOUT.margins.left, y);
  
  // Value
  doc.setFont(PDF_FONTS.primary, options?.bold ? PDF_FONTS.weights.bold : PDF_FONTS.weights.normal);
  doc.setTextColor(...(options?.valueColor || PDF_COLORS.dark));
  doc.text(value, PDF_LAYOUT.margins.left + 60, y);
  
  return y + PDF_LAYOUT.lineHeight;
};

/**
 * Add a highlighted value box (for totals, etc.)
 */
export const addHighlightBox = (
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  options?: { bgColor?: [number, number, number]; textColor?: [number, number, number] }
): number => {
  const boxWidth = PDF_LAYOUT.contentWidth;
  const boxHeight = 15;
  const boxX = PDF_LAYOUT.margins.left;
  
  // Background
  doc.setFillColor(...(options?.bgColor || PDF_COLORS.light));
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, 'F');
  
  // Label
  doc.setFontSize(PDF_FONTS.sizes.body);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.normal);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(label, boxX + 5, y + 10);
  
  // Value
  doc.setFontSize(PDF_FONTS.sizes.heading);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...(options?.textColor || PDF_COLORS.primary));
  doc.text(value, boxX + boxWidth - 5, y + 10, { align: 'right' });
  
  return y + boxHeight + 8;
};

/**
 * Add a status badge
 */
export const addStatusBadge = (
  doc: jsPDF,
  status: string,
  x: number,
  y: number,
  color: [number, number, number]
): void => {
  const textWidth = doc.getTextWidth(status);
  const padding = 4;
  const badgeWidth = textWidth + padding * 2;
  const badgeHeight = 7;
  
  // Badge background
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 5, badgeWidth, badgeHeight, 1, 1, 'F');
  
  // Badge text
  doc.setFontSize(PDF_FONTS.sizes.small);
  doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.bold);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text(status, x + padding, y);
};

/**
 * Add standard footer
 */
export const addPdfFooter = (doc: jsPDF, customText?: string): void => {
  const pageCount = doc.internal.pages.length - 1;
  const footerY = doc.internal.pageSize.height - PDF_LAYOUT.margins.bottom;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(
      PDF_LAYOUT.margins.left,
      footerY - 5,
      doc.internal.pageSize.width - PDF_LAYOUT.margins.right,
      footerY - 5
    );
    
    // Footer text
    doc.setFontSize(PDF_FONTS.sizes.tiny);
    doc.setFont(PDF_FONTS.primary, PDF_FONTS.weights.italic);
    doc.setTextColor(...PDF_COLORS.muted);
    
    const footerText = customText || 'This is a computer-generated document.';
    doc.text(footerText, doc.internal.pageSize.width / 2, footerY, { align: 'center' });
    
    // Page number
    if (pageCount > 1) {
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - PDF_LAYOUT.margins.right,
        footerY,
        { align: 'right' }
      );
    }
  }
};

/**
 * Add a divider line
 */
export const addDivider = (doc: jsPDF, y: number): number => {
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(
    PDF_LAYOUT.margins.left,
    y,
    doc.internal.pageSize.width - PDF_LAYOUT.margins.right,
    y
  );
  return y + 8;
};

/**
 * Get current Y position after autoTable
 */
export const getTableEndY = (doc: jsPDF): number => {
  return (doc as any).lastAutoTable?.finalY || PDF_LAYOUT.margins.top + 50;
};

/**
 * Check if content will fit on current page, add new page if needed
 */
export const ensureSpace = (doc: jsPDF, currentY: number, requiredSpace: number): number => {
  const maxY = doc.internal.pageSize.height - PDF_LAYOUT.margins.bottom - 20;
  if (currentY + requiredSpace > maxY) {
    doc.addPage();
    return PDF_LAYOUT.margins.top;
  }
  return currentY;
};
