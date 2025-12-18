import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountService } from '@/services/accountService';
import { Account, AccountType } from '@/models/interfaces/Account';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const formSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  bankName: z.string().optional(),
});

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
  onSuccess: () => void;
}

export function EditAccountDialog({ open, onOpenChange, account, onSuccess }: EditAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { accountName: account.accountName, bankName: account.bankName || '' },
  });

  useEffect(() => {
    form.reset({ accountName: account.accountName, bankName: account.bankName || '' });
  }, [account, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await AccountService.updateAccount(account.id, {
        accountName: values.accountName,
        bankName: account.accountType === AccountType.Bank ? values.bankName : null,
      });
      toast.success('Account updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Account</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="accountName" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {account.accountType === AccountType.Bank && (
              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
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
