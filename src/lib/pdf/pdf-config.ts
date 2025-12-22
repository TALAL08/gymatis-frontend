/**
 * Centralized PDF configuration for consistent styling across all PDF exports
 */

// Color palette (RGB values)
export const PDF_COLORS = {
  primary: [59, 130, 246] as [number, number, number],      // Blue
  secondary: [100, 116, 139] as [number, number, number],   // Slate
  success: [34, 197, 94] as [number, number, number],       // Green
  warning: [245, 158, 11] as [number, number, number],      // Amber
  danger: [239, 68, 68] as [number, number, number],        // Red
  dark: [15, 23, 42] as [number, number, number],           // Slate 900
  muted: [100, 116, 139] as [number, number, number],       // Slate 500
  light: [241, 245, 249] as [number, number, number],       // Slate 100
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],      // Slate 200
};

// Typography settings
export const PDF_FONTS = {
  primary: 'helvetica',
  sizes: {
    title: 20,
    subtitle: 16,
    heading: 14,
    subheading: 12,
    body: 11,
    small: 10,
    tiny: 9,
  },
  weights: {
    normal: 'normal' as const,
    bold: 'bold' as const,
    italic: 'italic' as const,
  },
};

// Spacing and layout
export const PDF_LAYOUT = {
  margins: {
    left: 14,
    right: 14,
    top: 20,
    bottom: 20,
  },
  lineHeight: 7,
  sectionGap: 15,
  paragraphGap: 5,
  pageWidth: 210,  // A4 width in mm
  pageHeight: 297, // A4 height in mm
  contentWidth: 182, // pageWidth - left - right margins
};

// Table styling
export const PDF_TABLE_STYLES = {
  headStyles: {
    fillColor: PDF_COLORS.primary,
    textColor: PDF_COLORS.white,
    fontStyle: 'bold' as const,
    fontSize: PDF_FONTS.sizes.body,
    halign: 'left' as const,
    cellPadding: 4,
  },
  bodyStyles: {
    fontSize: PDF_FONTS.sizes.body,
    cellPadding: 4,
    textColor: PDF_COLORS.dark,
  },
  alternateRowStyles: {
    fillColor: PDF_COLORS.light,
  },
  styles: {
    overflow: 'linebreak' as const,
    fontSize: PDF_FONTS.sizes.body,
  },
};

// Common status badge colors
export const PDF_STATUS_COLORS = {
  paid: PDF_COLORS.success,
  unpaid: PDF_COLORS.warning,
  pending: PDF_COLORS.warning,
  active: PDF_COLORS.success,
  inactive: PDF_COLORS.muted,
  expired: PDF_COLORS.danger,
  cancelled: PDF_COLORS.danger,
  overdue: PDF_COLORS.danger,
};

// Currency formatting
export const formatCurrency = (amount: number, currency = 'Rs.'): string => {
  return `${currency} ${amount.toLocaleString()}`;
};

// Date formatting for PDFs
export const formatPdfDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Short date format
export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
