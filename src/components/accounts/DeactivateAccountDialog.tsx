import { useState } from 'react';
import { AccountService } from '@/services/accountService';
import { Account } from '@/models/interfaces/Account';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DeactivateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
  onSuccess: () => void;
}

export function DeactivateAccountDialog({ open, onOpenChange, account, onSuccess }: DeactivateAccountDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await AccountService.deactivateAccount(account.id);
      toast.success(`Account ${account.isActive ? 'deactivated' : 'activated'} successfully`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update account status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account.isActive ? 'Deactivate' : 'Activate'} Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to {account.isActive ? 'deactivate' : 'activate'} "{account.accountName}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={account.isActive ? 'destructive' : 'default'} onClick={handleDeactivate} disabled={loading}>
            {loading ? 'Processing...' : account.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
