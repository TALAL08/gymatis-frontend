import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrainerService } from "@/services/trainerService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Trainer } from "@/models/interfaces/Trainer";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  pricePerSession: z.number().min(0, "Price per session is required"),
  monthlyAddonPrice: z.number().min(0, "Monthly addon price is required"),
  isActive: z.boolean(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTrainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: Trainer;
}

export function EditTrainerDialog({ open, onOpenChange, trainer }: EditTrainerDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      specialties: "",
      pricePerSession: 0,
      monthlyAddonPrice: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (trainer) {
      form.reset({
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email || "",
        phone: trainer.phone || "",
        bio: trainer.bio || "",
        specialties: trainer.specialties ? trainer.specialties.join(", ") : "",
        pricePerSession: trainer.pricePerSession,
        monthlyAddonPrice: trainer.monthlyAddonPrice,
        isActive: trainer.isActive,
      });
    }
  }, [trainer, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      let photoUrl = trainer.photoUrl;

      // Upload new photo if provided
      if (values.photo && values.photo[0]) {
        const file = values.photo[0];
        photoUrl = await TrainerService.uploadPhoto(trainer.id, file);
      }

      // Parse specialties from comma-separated string
      const specialtiesArray = values.specialties
        ? values.specialties.split(",").map((s) => s.trim()).filter(Boolean)
        : null;

      await TrainerService.updateTrainer(trainer.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
        specialties: specialtiesArray,
        pricePerSession: values.pricePerSession,
        monthlyAddonPrice: values.monthlyAddonPrice,
        isActive: values.isActive,
        photoUrl: photoUrl,
      });

      toast.success("Trainer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update trainer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trainer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Strength Training, Yoga, CrossFit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Session</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyAddonPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Add-on Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Current photo will be replaced if you upload a new one
                  </p>
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
                      Set trainer availability status
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
