import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, Loader2, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainerSalaryService } from "@/services/trainerSalaryService";
import { TrainerService } from "@/services/trainerService";

const formSchema = z.object({
  baseSalary: z.number().min(0, "Base salary must be positive"),
  perMemberIncentive: z.number().min(0, "Incentive must be positive"),
  effectiveFrom: z.date(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface TrainerSalaryConfigSectionProps {
  trainerId: number;
}

export function TrainerSalaryConfigSection({ trainerId }: TrainerSalaryConfigSectionProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: salaryConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["trainer-salary-config", trainerId],
    queryFn: () => TrainerService.getSalaryConfig(trainerId),
    enabled: !!trainerId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseSalary: 0,
      perMemberIncentive: 0,
      effectiveFrom: new Date(),
      isActive: true,
    },
  });

  useEffect(() => {
    if (salaryConfig) {
      form.reset({
        baseSalary: salaryConfig.baseSalary,
        perMemberIncentive: salaryConfig.perMemberIncentive,
        effectiveFrom: new Date(salaryConfig.effectiveFrom),
        isActive: salaryConfig.isActive,
      });
    }
  }, [salaryConfig, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (salaryConfig) {
        await TrainerService.updateSalaryConfig(trainerId, {
          baseSalary: values.baseSalary,
          perMemberIncentive: values.perMemberIncentive,
          effectiveFrom: values.effectiveFrom.toISOString(),
          isActive: values.isActive,
        });
        toast.success("Salary configuration updated");
      } else {
        await TrainerService.createSalaryConfig({
          trainerId,
          baseSalary: values.baseSalary,
          perMemberIncentive: values.perMemberIncentive,
          effectiveFrom: values.effectiveFrom.toISOString(),
          isActive: values.isActive,
        });
        toast.success("Salary configuration created");
      }
      queryClient.invalidateQueries({ queryKey: ["trainer-salary-config", trainerId] });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save salary configuration");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Salary & Incentives
            </CardTitle>
            <CardDescription>
              Configure base salary and per-member incentives for this trainer
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              {salaryConfig ? "Edit" : "Configure"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Monthly Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perMemberIncentive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Member Incentive</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effective From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable salary configuration
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        ) : salaryConfig ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Base Salary</p>
              <p className="text-xl font-semibold">{salaryConfig.baseSalary.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Per Member Incentive</p>
              <p className="text-xl font-semibold">{salaryConfig.perMemberIncentive.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Effective From</p>
              <p className="text-xl font-semibold">
                {format(new Date(salaryConfig.effectiveFrom), "MMM d, yyyy")}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={cn("text-xl font-semibold", salaryConfig.isActive ? "text-success" : "text-muted-foreground")}>
                {salaryConfig.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No salary configuration set up yet.</p>
            <p className="text-sm">Click "Configure" to set up salary and incentives.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
