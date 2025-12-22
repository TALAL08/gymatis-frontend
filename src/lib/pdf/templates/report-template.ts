/**
 * Generic Report PDF Template
 * Generates consistent, professional report PDFs with flexible table data
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_TABLE_STYLES,
  formatPdfDate,
} from '../pdf-config';
import {
  createPdfDocument,
  addPdfHeader,
  addSectionHeader,
  addPdfFooter,
  addDivider,
  getTableEndY,
  PDF_LAYOUT,
} from '../pdf-utils';

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface ReportSummaryItem {
  label: string;
  value: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'muted';
}

export interface ReportPdfOptions {
  title: string;
  subtitle?: string;
  gymName?: string;
  columns: ReportColumn[];
  data: Record<string, any>[];
  summary?: ReportSummaryItem[];
  headerColor?: [number, number, number];
  footerText?: string;
}

/**
 * Generate a generic report PDF
 */
export const generateReportPdf = (options: ReportPdfOptions): jsPDF => {
  const doc = createPdfDocument();

  // Header
  let currentY = addPdfHeader(doc, options.title, options.subtitle, {
    gymName: options.gymName,
  });

  // Summary section if provided
  if (options.summary && options.summary.length > 0) {
    const summaryY = currentY;
    const colWidth = PDF_LAYOUT.contentWidth / Math.min(options.summary.length, 4);
    
    options.summary.forEach((item, index) => {
      const x = PDF_LAYOUT.margins.left + (index % 4) * colWidth;
      const y = summaryY + Math.floor(index / 4) * 25;
      
      // Box background
      doc.setFillColor(...PDF_COLORS.light);
      doc.roundedRect(x, y, colWidth - 5, 20, 2, 2, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text(item.label, x + 5, y + 8);
      
      // Value
      const colorMap = {
        primary: PDF_COLORS.primary,
        success: PDF_COLORS.success,
        warning: PDF_COLORS.warning,
        danger: PDF_COLORS.danger,
        muted: PDF_COLORS.muted,
      };
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(colorMap[item.color || 'primary'] || PDF_COLORS.dark));
      doc.text(item.value, x + 5, y + 16);
    });
    
    currentY += Math.ceil(options.summary.length / 4) * 25 + 10;
    currentY = addDivider(doc, currentY);
  }

  // Data Table
  const headers = options.columns.map((col) => col.header);
  const body = options.data.map((row) =>
    options.columns.map((col) => {
      const value = row[col.key];
      return col.format ? col.format(value) : String(value ?? '-');
    })
  );

  const columnStyles: Record<number, any> = {};
  options.columns.forEach((col, index) => {
    columnStyles[index] = {
      cellWidth: col.width || 'auto',
      halign: col.align || 'left',
    };
  });

  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: body,
    ...PDF_TABLE_STYLES,
    headStyles: {
      ...PDF_TABLE_STYLES.headStyles,
      fillColor: options.headerColor || PDF_COLORS.primary,
    },
    columnStyles,
  });

  // Footer
  addPdfFooter(doc, options.footerText || `Generated on ${formatPdfDate(new Date())}`);

  return doc;
};

/**
 * Download report PDF
 */
export const downloadReportPdf = (
  options: ReportPdfOptions,
  fileName?: string
): void => {
  const doc = generateReportPdf(options);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = options.title.toLowerCase().replace(/\s+/g, '-');
  doc.save(fileName || `${safeName}-${dateStr}.pdf`);
};
