# Services Layer Documentation

## Overview

This directory contains all service files that handle database interactions with Supabase. Components should **never** call Supabase directly - they should always use these service classes.

## Architecture

```
/services
  ├── memberService.ts       - Member CRUD & queries
  ├── gymService.ts          - Gym management
  ├── subscriptionService.ts - Subscription management
  ├── packageService.ts      - Package management
  ├── invoiceService.ts      - Invoice & billing
  ├── trainerService.ts      - Trainer management
  ├── attendanceService.ts   - Attendance tracking
  ├── transactionService.ts  - Payment transactions
  ├── userRoleService.ts     - User roles & permissions
  ├── profileService.ts      - User profiles
  └── authService.ts         - Authentication
```

## Usage Guidelines

### 1. **Always use services in components**

❌ **Bad** - Direct Supabase call:
```tsx
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('gym_id', gymId);
```

✅ **Good** - Using service:
```tsx
import { MemberService } from '@/services/memberService';

const members = await MemberService.getMembersByGym(gymId);
```

### 2. **Handle errors gracefully**

```tsx
try {
  const member = await MemberService.getMemberById(memberId);
  // Use member data
} catch (error) {
  toast.error(error.message || 'Failed to load member');
}
```

### 3. **Use TypeScript types from Supabase**

Services automatically use typed responses from Supabase:

```tsx
import { Tables } from '@/integrations/supabase/types';

type Member = Tables<'members'>;

// Service methods return properly typed data
const member: Member = await MemberService.getMemberById(id);
```

## Service Examples

### MemberService

```tsx
// Get all members for a gym
const members = await MemberService.getMembersByGym(gymId);

// Get member with details (subscriptions, invoices)
const memberDetails = await MemberService.getMemberWithDetails(memberId);

// Create a member
const newMember = await MemberService.createMember({
  gym_id: gymId,
  first_name: 'John',
  last_name: 'Doe',
  phone: '1234567890',
  member_code: 'MEM000001',
  status: 'active'
});

// Update a member
await MemberService.updateMember(memberId, { status: 'inactive' });

// Delete a member
await MemberService.deleteMember(memberId);

// Upload photo
const photoUrl = await MemberService.uploadPhoto(memberId, photoFile);

// Search members
const results = await MemberService.searchMembers(gymId, 'john');
```

### SubscriptionService

```tsx
// Get all subscriptions for a gym
const subscriptions = await SubscriptionService.getSubscriptionsByGym(gymId);

// Get member's subscriptions
const memberSubs = await SubscriptionService.getSubscriptionsByMember(memberId);

// Get active subscription
const activeSub = await SubscriptionService.getActiveSubscription(memberId);

// Create subscription
const newSub = await SubscriptionService.createSubscription({
  gym_id: gymId,
  member_id: memberId,
  package_id: packageId,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  price_paid: 1200,
  status: 'active'
});

// Renew subscription
await SubscriptionService.renewSubscription(oldSubId, newSubData);

// Cancel subscription
await SubscriptionService.cancelSubscription(subscriptionId);
```

### InvoiceService

```tsx
// Get all invoices for a gym
const invoices = await InvoiceService.getInvoicesByGym(gymId);

// Get pending invoices
const pending = await InvoiceService.getPendingInvoices(gymId);

// Create invoice (auto-generates invoice number)
const invoice = await InvoiceService.createInvoice({
  gym_id: gymId,
  member_id: memberId,
  subscription_id: subscriptionId,
  amount: 1200,
  discount: 0,
  net_amount: 1200,
  status: 'pending',
  due_date: '2024-12-31'
});

// Mark as paid
await InvoiceService.markInvoiceAsPaid(invoiceId, 'cash');

// Update overdue invoices
await InvoiceService.updateOverdueInvoices(gymId);
```

### AttendanceService

```tsx
// Check in a member
const log = await AttendanceService.checkIn(gymId, memberId, userId, 'Web App');

// Check out a member
await AttendanceService.checkOut(attendanceId);

// Get today's attendance
const todayLogs = await AttendanceService.getTodayAttendance(gymId);

// Get currently checked-in members
const checkedIn = await AttendanceService.getCurrentlyCheckedIn(gymId);

// Get attendance for date range
const stats = await AttendanceService.getAttendanceStats(
  gymId, 
  '2024-01-01', 
  '2024-12-31'
);
```

### TrainerService

```tsx
// Get all trainers
const trainers = await TrainerService.getTrainersByGym(gymId);

// Get active trainers only
const activeTrainers = await TrainerService.getActiveTrainers(gymId);

// Get trainer with assigned members
const trainerDetails = await TrainerService.getTrainerWithMembers(trainerId);

// Create trainer
const trainer = await TrainerService.createTrainer({
  gym_id: gymId,
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  monthly_addon_price: 500
});

// Upload photo
const photoUrl = await TrainerService.uploadPhoto(trainerId, file);

// Toggle active status
await TrainerService.toggleTrainerStatus(trainerId, false);
```

### AuthService

```tsx
// Sign up new user with gym
await AuthService.signUp(
  email,
  password,
  firstName,
  lastName,
  phone,
  gymName,
  gymLocation
);

// Sign in
const { user, session } = await AuthService.signIn(email, password);

// Sign out
await AuthService.signOut();

// Get current user
const user = await AuthService.getCurrentUser();

// Reset password
await AuthService.resetPassword(email);
```

## Best Practices

### 1. **Create focused service methods**

Each method should do one thing well:

```tsx
// Good - Focused methods
static async createMember(data: MemberInsert): Promise<Member>
static async updateMember(id: string, updates: MemberUpdate): Promise<Member>
static async deleteMember(id: string): Promise<void>
```

### 2. **Return typed data**

Always return properly typed data from Supabase:

```tsx
static async getMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

### 3. **Use `.maybeSingle()` when data might not exist**

```tsx
// Use maybeSingle() instead of single() when row might not exist
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle(); // Won't throw error if no row found
```

### 4. **Handle file uploads properly**

```tsx
static async uploadPhoto(id: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${id}-${Date.now()}.${fileExt}`;
  const filePath = `${id}/${fileName}`;

  const { error } = await supabase.storage
    .from('bucket-name')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

### 5. **Use transactions for related operations**

When operations depend on each other, handle them in sequence:

```tsx
static async renewSubscription(
  oldSubscriptionId: string,
  newSubscriptionData: SubscriptionInsert
): Promise<Subscription> {
  // Mark old subscription as expired first
  await this.updateSubscription(oldSubscriptionId, { status: 'expired' });

  // Then create new subscription
  return this.createSubscription(newSubscriptionData);
}
```

## Component Integration

### Example: Member List Component

```tsx
import { useQuery } from '@tanstack/react-query';
import { MemberService } from '@/services/memberService';
import { useAuth } from '@/contexts/AuthContext';

function MemberList() {
  const { gymId } = useAuth();

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members', gymId],
    queryFn: () => MemberService.getMembersByGym(gymId!),
    enabled: !!gymId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {members?.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
```

### Example: Create Member Dialog

```tsx
import { useState } from 'react';
import { MemberService } from '@/services/memberService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function AddMemberDialog({ gymId }: { gymId: string }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      // Generate member code
      const memberCode = await MemberService.generateMemberCode(gymId);

      // Create member
      const member = await MemberService.createMember({
        ...formData,
        gym_id: gymId,
        member_code: memberCode,
      });

      // Upload photo if provided
      if (photoFile) {
        const photoUrl = await MemberService.uploadPhoto(member.id, photoFile);
        await MemberService.updateMember(member.id, { photo_url: photoUrl });
      }

      toast.success('Member created successfully');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Migration Guide

To migrate existing components:

1. **Import the service:**
   ```tsx
   import { MemberService } from '@/services/memberService';
   ```

2. **Replace Supabase calls:**
   ```tsx
   // Old
   const { data } = await supabase.from('members').select('*');
   
   // New
   const members = await MemberService.getMembersByGym(gymId);
   ```

3. **Update error handling:**
   ```tsx
   try {
     const result = await MemberService.createMember(data);
   } catch (error) {
     toast.error(error.message);
   }
   ```

4. **Test thoroughly:** Ensure all functionality works as expected.

## Adding New Services

When adding a new service:

1. Create file in `/services/` directory
2. Import Supabase client and types
3. Export a class with static methods
4. Follow naming conventions (e.g., `getXByY`, `createX`, `updateX`, `deleteX`)
5. Add proper TypeScript types
6. Document the service in this README

## Notes

- Services handle **only** database operations - no UI logic
- Services throw errors - components handle them
- Services return typed data from Supabase
- Always invalidate queries after mutations
- Use React Query for data fetching in components
