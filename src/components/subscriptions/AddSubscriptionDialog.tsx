import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MemberService } from '@/services/memberService';
import { PackageService } from '@/services/packageService';
import { TrainerService } from '@/services/trainerService';
import { SubscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Package } from '@/models/interfaces/Package';
import { Trainer } from '@/models/interfaces/Trainer';

const formSchema = z.object({
  memberId: z.string().min(1, 'Please select a member'),
  packageId: z.string().min(1, 'Please select a package'),
  trainerId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  pricePaid: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Price must be a positive number'
  ),
  notes: z.string().optional(),
});

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddSubscriptionDialog({ open, onOpenChange, onSuccess }: AddSubscriptionDialogProps) {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: '',
      packageId: '',
      trainerId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      pricePaid: '',
      notes: '',
    },
  });

  // Fetch members
  const { data: members } = useQuery({
    queryKey: ['members', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await MemberService.getMembersByGym(gymId);
    },
    enabled: !!gymId && open,
  });

  // Fetch packages
  const { data: packages } = useQuery({
    queryKey: ['packages', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await PackageService.getPackagesByGym(gymId);
    },
    enabled: !!gymId && open,
  });

  // Fetch trainers
  const { data: trainers } = useQuery({
    queryKey: ['trainers', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await TrainerService.getTrainersByGym(gymId);
    },
    enabled: !!gymId && open,
  });

  // Update price when package or trainer changes
  useEffect(() => {
    if (selectedPackage) {
      let totalPrice = selectedPackage.price;
      if (selectedTrainer && selectedPackage.allowsTrainerAddon) {
        totalPrice += selectedTrainer.monthlyAddonPrice;
      }
      form.setValue('pricePaid', totalPrice.toString());
    }
  }, [selectedPackage, selectedTrainer, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date(values.startDate);
      const endDate = addDays(startDate, selectedPackage.durationDays);
      const pricePaid = parseFloat(values.pricePaid)-selectedTrainer.monthlyAddonPrice;

      // Create subscription
      const subscription = await SubscriptionService.createSubscription({
        gymId: gymId!,
        memberId: Number(values.memberId),
        packageId: Number(values.packageId),
        trainerId: Number(values.trainerId) || null,
        trainerAddonPrice: selectedTrainer?.monthlyAddonPrice || 0,
        pricePaid: pricePaid,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        notes: values.notes || null,
      });

      toast.success('Subscription and invoice created successfully');
      form.reset();
      setSelectedPackage(null);
      setSelectedTrainer(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Subscription</DialogTitle>
          <DialogDescription>Create a new subscription for a member</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members?.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.firstName} {member.lastName} ({member.memberCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const pkg = packages?.find((p) => p.id.toString() === value);
                      setSelectedPackage(pkg);
                    }}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                          {pkg.name} - {pkg.price} ({pkg.durationDays} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPackage?.allowsTrainerAddon && (
              <FormField
                control={form.control}
                name="trainerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trainer (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === "none") {
                          field.onChange("");
                          setSelectedTrainer(null);
                        } else {
                          field.onChange(value);
                          const trainer = trainers?.find((t) => t.id.toString() === value);
                          setSelectedTrainer(trainer);
                        }
                      }}
                      value={field.value === "" ? "none" : field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trainer" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="none">No Trainer</SelectItem>

                        {trainers?.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id.toString()}>
                            {trainer.firstName} {trainer.lastName} - {trainer.monthlyAddonPrice}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormDescription>
                      Adding a trainer will increase the subscription price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Paid *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      {selectedPackage && (
                        <>
                          Base: {selectedPackage.price}
                          {selectedTrainer && ` + Trainer: ${selectedTrainer.monthlyAddonPrice}`}
                        </>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPackage && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>End Date:</strong>{' '}
                  {format(
                    addDays(new Date(form.watch('startDate')), selectedPackage.durationDays),
                    'PPP'
                  )}
                </p>
                <p className="text-sm mt-1">
                  <strong>Duration:</strong> {selectedPackage.durationDays} days
                </p>
              </div>
            )}

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
                {loading ? 'Creating...' : 'Create Subscription'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
