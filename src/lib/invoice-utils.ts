import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a unique invoice number in the format: INV-YYYYMMDD-XXXX
 * where XXXX is a sequential number for that day
 */
export async function generateInvoiceNumber(gymId: string): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
  const invoicePrefix = `INV-${datePrefix}`;

  // Get count of invoices created today for this gym
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('gym_id', gymId)
    .like('invoice_number', `${invoicePrefix}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching invoice count:', error);
    // Fallback to timestamp-based number
    return `${invoicePrefix}-${Date.now().toString().slice(-4)}`;
  }

  let sequenceNumber = 1;
  if (data && data.length > 0) {
    // Extract the sequence number from the last invoice
    const lastInvoiceNumber = data[0].invoice_number;
    const lastSequence = parseInt(lastInvoiceNumber.split('-').pop() || '0', 10);
    sequenceNumber = lastSequence + 1;
  }

  // Pad the sequence number to 4 digits
  const paddedSequence = sequenceNumber.toString().padStart(4, '0');
  return `${invoicePrefix}-${paddedSequence}`;
}


/**
 * Updates overdue invoices based on due date
 */
export async function updateOverdueInvoices(gymId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('gym_id', gymId)
    .eq('status', 'pending')
    .lt('due_date', today)
    .not('due_date', 'is', null);

  if (error) {
    console.error('Error updating overdue invoices:', error);
    throw error;
  }
}
