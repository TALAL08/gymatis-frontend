import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PackageService } from '@/services/packageService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  durationDays: z.string().min(1, 'Duration is required'),
  price: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Price must be a positive number'
  ),
  visitsLimit: z.string().optional(),
  allowsTrainerAddon: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

interface EditPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: any;
  onSuccess: () => void;
}

export function EditPackageDialog({
  open,
  onOpenChange,
  package: pkg,
  onSuccess,
}: EditPackageDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      durationDays: '30',
      price: '',
      visitsLimit: '',
      allowsTrainerAddon: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        description: pkg.description || '',
        durationDays: pkg.durationDays.toString(),
        price: pkg.price.toString(),
        visitsLimit: pkg.visitsLimit?.toString() || '',
        allowsTrainerAddon: pkg.allowsTrainerAddon,
        isActive: pkg.isActive,
      });
    }
  }, [pkg, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await PackageService.updatePackage(pkg.id, {
        name: values.name,
        description: values.description || null,
        durationDays: parseInt(values.durationDays),
        price: parseFloat(values.price),
        visitsLimit: values.visitsLimit ? parseInt(values.visitsLimit) : null,
        allowsTrainerAddon: values.allowsTrainerAddon,
        isActive: values.isActive,
      });

      toast.success('Package updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating package:', error);
      toast.error(error.message || 'Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
          <DialogDescription>Update package details</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Monthly, Premium Yearly" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the package benefits..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">1 Month (30 days)</SelectItem>
                        <SelectItem value="90">3 Months (90 days)</SelectItem>
                        <SelectItem value="180">6 Months (180 days)</SelectItem>
                        <SelectItem value="365">1 Year (365 days)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="99.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="visitsLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Leave empty for unlimited visits"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of visits allowed during the package duration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowsTrainerAddon"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Trainer Add-on</FormLabel>
                    <FormDescription>
                      Members can add a personal trainer to this package
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Make this package available for new subscriptions
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Package'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
