import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ExpenseService } from '@/services/expenseService';
import { AccountService } from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';
import { Expense } from '@/models/interfaces/Expense';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExpenseCategoryService } from '@/services/expenseCategoryService';

const formSchema = z.object({
  expenseDate: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  accountId: z.string().min(1, 'Account is required'),
});

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
  onSuccess: () => void;
}

export function EditExpenseDialog({ open, onOpenChange, expense, onSuccess }: EditExpenseDialogProps) {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['expense-categories', gymId],
    queryFn: () => ExpenseCategoryService.getActiveCategories(gymId!),
    enabled: !!gymId && open,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts-active', gymId],
    queryFn: () => AccountService.getActiveAccounts(gymId!),
    enabled: !!gymId && open,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { expenseDate: expense.expenseDate, categoryId: expense.categoryId, description: expense.description || '', amount: expense.amount, accountId: expense.accountId },
  });

  useEffect(() => {
    form.reset({ expenseDate: expense.expenseDate, categoryId: expense.categoryId, description: expense.description || '', amount: expense.amount, accountId: expense.accountId });
  }, [expense, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await ExpenseService.updateExpense(expense.id, values);
      toast.success('Expense updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="expenseDate" render={({ field }) => (
              <FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem><FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem><FormLabel>Paid From Account *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{accounts?.map((acc) => <SelectItem key={acc.id} value={acc.id}>{acc.accountName}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={loading}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
