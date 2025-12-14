import { useState } from 'react';
import { PackageService } from '@/services/packageService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeletePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: any;
  onSuccess: () => void;
}

export function DeletePackageDialog({
  open,
  onOpenChange,
  package: pkg,
  onSuccess,
}: DeletePackageDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await PackageService.deletePackage(pkg.id);

      toast.success('Package deleted successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast.error(error.message || 'Failed to delete package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Package</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the package "{pkg?.name}"? This action cannot be
            undone. Any existing subscriptions using this package will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
