import { useState } from 'react';
import { ExpenseService } from '@/services/expenseService';
import { Expense } from '@/models/interfaces/Expense';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
  onSuccess: () => void;
}

export function DeleteExpenseDialog({ open, onOpenChange, expense, onSuccess }: DeleteExpenseDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await ExpenseService.deleteExpense(expense.id);
      toast.success('Expense deleted successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>Are you sure you want to delete this expense? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
