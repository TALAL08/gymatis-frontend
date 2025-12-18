import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ExpenseService } from '@/services/expenseService';
import { AccountService } from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

const formSchema = z.object({
  expenseDate: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  accountId: z.string().min(1, 'Account is required'),
  referenceNumber: z.string().optional(),
});

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExpenseDialog({ open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['expense-categories', gymId],
    queryFn: () => ExpenseService.getActiveCategories(gymId!),
    enabled: !!gymId && open,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts-active', gymId],
    queryFn: () => AccountService.getActiveAccounts(gymId!),
    enabled: !!gymId && open,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { expenseDate: format(new Date(), 'yyyy-MM-dd'), categoryId: '', description: '', amount: 0, accountId: '', referenceNumber: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await ExpenseService.createExpense({
        gymId: String(gymId!),
        expenseDate: values.expenseDate,
        categoryId: values.categoryId,
        description: values.description,
        amount: values.amount,
        accountId: values.accountId,
        referenceNumber: values.referenceNumber,
      });
      toast.success('Expense added successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="expenseDate" render={({ field }) => (
              <FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem><FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                  <SelectContent>{accounts?.map((acc) => <SelectItem key={acc.id} value={acc.id}>{acc.accountName}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={loading}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Adding...' : 'Add Expense'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
