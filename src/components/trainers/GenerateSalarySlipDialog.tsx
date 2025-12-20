import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrainerService } from "@/services/trainerService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrainerSalaryService } from "@/services/trainerSalaryService";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const formSchema = z.object({
  trainerId: z.string().min(1, "Please select a trainer"),
  month: z.string().min(1, "Please select a month"),
  year: z.string().min(1, "Please select a year"),
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateSalarySlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTrainerId?: number;
}

export function GenerateSalarySlipDialog({ open, onOpenChange, preselectedTrainerId }: GenerateSalarySlipDialogProps) {
  const { gymId } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{
    baseSalary: number;
    memberCount: number;
    incentiveRate: number;
    incentiveTotal: number;
    grossSalary: number;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const currentMonth = new Date().getMonth() + 1;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainerId: preselectedTrainerId?.toString() || "",
      month: currentMonth.toString(),
      year: currentYear.toString(),
    },
  });

  const { data: trainers, isLoading: loadingTrainers } = useQuery({
    queryKey: ["trainers-active", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await TrainerService.getActiveTrainers(gymId);
    },
    enabled: !!gymId && open,
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const loadPreview = async () => {
      const { trainerId, month, year } = watchedValues;
      if (!trainerId || !month || !year) {
        setPreview(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const [salaryConfig, memberCount] = await Promise.all([
          TrainerService.getSalaryConfig(parseInt(trainerId)),
          TrainerService.getActiveMemberCount(parseInt(trainerId), parseInt(month), parseInt(year)),
        ]);

        if (salaryConfig) {
          const incentiveTotal = memberCount * salaryConfig.perMemberIncentive;
          setPreview({
            baseSalary: salaryConfig.baseSalary,
            memberCount,
            incentiveRate: salaryConfig.perMemberIncentive,
            incentiveTotal,
            grossSalary: salaryConfig.baseSalary + incentiveTotal,
          });
        } else {
          setPreview(null);
        }
      } catch (error) {
        console.error("Failed to load preview:", error);
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    const debounce = setTimeout(loadPreview, 300);
    return () => clearTimeout(debounce);
  }, [watchedValues.trainerId, watchedValues.month, watchedValues.year]);

  useEffect(() => {
    if (preselectedTrainerId) {
      form.setValue("trainerId", preselectedTrainerId.toString());
    }
  }, [preselectedTrainerId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!gymId) return;

    setIsLoading(true);
    try {
      await TrainerSalaryService.generateSalarySlip(gymId,  parseInt(values.trainerId),{
        salaryMonth: parseInt(values.month),
        salaryYear: parseInt(values.year),
      });

      toast.success("Salary slip generated successfully");
      queryClient.invalidateQueries({ queryKey: ["salary-slips"] });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Salary slip already exists for this trainer and month");
      } else {
        toast.error(error.message || "Failed to generate salary slip");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Generate Salary Slip
          </DialogTitle>
          <DialogDescription>
            Generate a monthly salary slip for a trainer based on their active members.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trainerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trainer</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!preselectedTrainerId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingTrainers ? (
                        <div className="p-2 text-center text-muted-foreground">Loading...</div>
                      ) : (
                        trainers?.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id.toString()}>
                            {trainer.firstName} {trainer.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {previewLoading ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Calculating...</p>
                </CardContent>
              </Card>
            ) : preview ? (
              <Card>
                <CardContent className="py-4 space-y-3">
                  <h4 className="font-medium text-sm">Salary Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Base Salary:</span>
                    <span className="text-right font-medium">{preview.baseSalary.toLocaleString()}</span>
                    
                    <span className="text-muted-foreground">Active Members:</span>
                    <span className="text-right font-medium">{preview.memberCount}</span>
                    
                    <span className="text-muted-foreground">Incentive Rate:</span>
                    <span className="text-right font-medium">{preview.incentiveRate.toLocaleString()} / member</span>
                    
                    <span className="text-muted-foreground">Incentive Total:</span>
                    <span className="text-right font-medium">{preview.incentiveTotal.toLocaleString()}</span>
                    
                    <div className="col-span-2 border-t my-1" />
                    
                    <span className="font-medium">Gross Salary:</span>
                    <span className="text-right font-bold text-primary">{preview.grossSalary.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ) : watchedValues.trainerId ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No salary configuration found for this trainer. Please configure salary settings first.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !preview}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Slip
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
