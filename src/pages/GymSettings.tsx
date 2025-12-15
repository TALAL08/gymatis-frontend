import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Building2, MapPin, Phone, Mail, Save, Globe, Settings } from 'lucide-react';
import { GymService } from '@/services/gymService';
import { useAuth } from '@/contexts/AuthContext';
import { GymUpdateRequest } from '@/models/interfaces/requests/GymUpdateRequest';
import { getDefaultTimezone, GetTimezones } from '@/lib/utils';

const TIMEZONES = GetTimezones;

const gymFormSchema = z.object({
  name: z.string().min(1, 'Gym name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().max(255, 'Address must be less than 255 characters').optional().nullable(),
  location: z.string().max(255, 'Location must be less than 255 characters').optional().nullable(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().nullable(),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').optional().nullable().or(z.literal('')),
  timeZone: z.string().optional().nullable(),
  settings: z.object({
    invoiceOverdueInDays: z.coerce.number().min(1, 'Must be at least 1 day'),
    memberInactiveInDays: z.coerce.number().min(1, 'Must be at least 1 day'),
  })
});

type GymFormValues = z.infer<typeof gymFormSchema>;


export default function GymSettings() {
  const { gymId } = useAuth();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const detectedTimezone = useMemo(() => getDefaultTimezone(), []);

  const { data: gym, isLoading, error } = useQuery({
    queryKey: ['gym', gymId],
    queryFn: () => GymService.getGymById(gymId!),
    enabled: !!gymId,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<GymFormValues>({
    resolver: zodResolver(gymFormSchema),
    defaultValues: {
      name: '',
      address: '',
      location: '',
      phone: '',
      email: '',
      timeZone: detectedTimezone,
      settings:{
      invoiceOverdueInDays: 1,
      memberInactiveInDays: 1,        
      }
    },
  });

  useEffect(() => {
    if (gym) {
      reset({
        name: gym.name || '',
        address: gym.address || '',
        location: gym.location || '',
        phone: gym.phone || '',
        email: gym.email || '',
        timeZone: gym.timeZone || detectedTimezone,
        settings:{
        invoiceOverdueInDays: gym.settings.invoiceOverdueInDays,
        memberInactiveInDays: gym.settings.memberInactiveInDays,          
        }
      });
      setLogoPreview(gym.logo);
    }
  }, [gym, reset, detectedTimezone]);

  const updateMutation = useMutation({
    mutationFn: async (data: GymUpdateRequest) => {
      return GymService.updateGym(gymId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym', gymId] });
      toast.success('Gym information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update gym information');
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      return GymService.uploadPhoto(gymId!, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym', gymId] });
      toast.success('Logo uploaded successfully');
      setLogoFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: GymFormValues) => {
    const updateData: GymUpdateRequest = {
      name: data.name,
      address: data.address || null,
      location: data.location || null,
      phone: data.phone || null,
      email: data.email || null,
      timeZone: data.timeZone || null,
      settings: {
        invoiceOverdueInDays: data.settings.invoiceOverdueInDays,
        memberInactiveInDays: data.settings.memberInactiveInDays,
      },
    };
    updateMutation.mutate(updateData);
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gymId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load gym settings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gym Settings</h1>
          <p className="text-muted-foreground">Manage your gym information and branding</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Gym Logo
            </CardTitle>
            <CardDescription>Upload your gym's logo for branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-border">
                <AvatarImage src={logoPreview || undefined} alt="Gym Logo" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Choose Logo</span>
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </Label>
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG or WEBP. Max 5MB.
                </p>
              </div>

              {logoFile && (
                <Button
                  onClick={handleLogoUpload}
                  disabled={uploadLogoMutation.isPending}
                  className="w-full"
                >
                  {uploadLogoMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gym Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gym Information
            </CardTitle>
            <CardDescription>Update your gym's contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Gym Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter gym name"
                    className="pl-10"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Enter gym address"
                    className="pl-10"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Map Coordinates)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., 40.7128,-74.0060"
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    className="pl-10"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeZone">Time Zone</Label>
                <Controller
                  name="timeZone"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {detectedTimezone && (
                  <p className="text-xs text-muted-foreground">
                    Auto-detected: {detectedTimezone.replace(/_/g, ' ')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending || !isDirty}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Settings Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>Configure automation rules for invoices and members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceOverdueInDays">
                  Invoice Overdue (Days) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoiceOverdueInDays"
                  type="number"
                  min={1}
                  placeholder="e.g., 7"
                  {...register('settings.invoiceOverdueInDays')}
                />
                <p className="text-xs text-muted-foreground">
                  After how many days an invoice should be marked as overdue
                </p>
                {errors.settings?.invoiceOverdueInDays && (
                  <p className="text-sm text-destructive">{errors.settings.invoiceOverdueInDays.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberInactiveInDays">
                  Member Inactive (Days) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="memberInactiveInDays"
                  type="number"
                  min={1}
                  placeholder="e.g., 30"
                  {...register('settings.memberInactiveInDays')}
                />
                <p className="text-xs text-muted-foreground">
                  After how many days of an unpaid invoice the member becomes inactive
                </p>
                {errors.settings?.memberInactiveInDays && (
                  <p className="text-sm text-destructive">{errors.settings.memberInactiveInDays.message}</p>
                )}
              </div>
            </div>

            <Button
              type="button"
              className="w-full mt-6"
              disabled={updateMutation.isPending || !isDirty}
              onClick={handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
