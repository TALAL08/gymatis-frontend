# Codebase Refactoring - Service Layer Implementation

## Overview

The codebase has been refactored to implement a **Service Layer Architecture** that separates database operations from UI components. This improves code organization, maintainability, and testability.

## Updated Project Structure

```
src/
├── components/              # UI Components
│   ├── ui/                 # Shadcn UI components
│   ├── members/            # Member-related components
│   ├── trainers/           # Trainer-related components
│   ├── packages/           # Package-related components
│   ├── subscriptions/      # Subscription-related components
│   ├── invoices/           # Invoice-related components
│   ├── staff/              # Staff-related components
│   ├── dashboard/          # Dashboard components
│   └── ...
├── services/               # ⭐ NEW - Service Layer
│   ├── memberService.ts
│   ├── gymService.ts
│   ├── subscriptionService.ts
│   ├── packageService.ts
│   ├── invoiceService.ts
│   ├── trainerService.ts
│   ├── attendanceService.ts
│   ├── transactionService.ts
│   ├── userRoleService.ts
│   ├── profileService.ts
│   ├── authService.ts
│   └── README.md           # Service documentation
├── pages/                  # Page components
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client
│       └── types.ts        # Auto-generated types
└── ...
```

## What Changed?

### Before (Direct Supabase Calls in Components)

```tsx
// ❌ Component with direct database calls
import { supabase } from '@/integrations/supabase/client';

function MemberList() {
  const [members, setMembers] = useState([]);
  
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', gymId);
        
      if (error) {
        console.error(error);
        return;
      }
      
      setMembers(data);
    };
    
    fetchMembers();
  }, [gymId]);
  
  return <div>...</div>;
}
```

### After (Using Service Layer)

```tsx
// ✅ Component using service layer
import { MemberService } from '@/services/memberService';

function MemberList() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['members', gymId],
    queryFn: () => MemberService.getMembersByGym(gymId),
  });
  
  return <div>...</div>;
}
```

## Services Created

### 1. MemberService (`memberService.ts`)
- `getMembersByGym(gymId)` - Get all members
- `getMemberById(id)` - Get single member
- `getMemberWithDetails(id)` - Get member with subscriptions & invoices
- `getMemberByUserId(userId)` - For member portal
- `createMember(data)` - Create new member
- `updateMember(id, updates)` - Update member
- `deleteMember(id)` - Delete member
- `uploadPhoto(id, file)` - Upload member photo
- `generateMemberCode(gymId)` - Generate unique member code
- `searchMembers(gymId, term)` - Search members

### 2. GymService (`gymService.ts`)
- `getAllGyms()` - Get all gyms (system admin)
- `getGymById(id)` - Get single gym
- `getCurrentUserGym(userId)` - Get user's gym
- `createGym(data)` - Create new gym
- `updateGym(id, updates)` - Update gym

### 3. SubscriptionService (`subscriptionService.ts`)
- `getSubscriptionsByGym(gymId)` - Get all subscriptions
- `getSubscriptionsByMember(memberId)` - Get member's subscriptions
- `getSubscriptionById(id)` - Get single subscription
- `getActiveSubscription(memberId)` - Get active subscription
- `createSubscription(data)` - Create subscription
- `updateSubscription(id, updates)` - Update subscription
- `cancelSubscription(id)` - Cancel subscription
- `renewSubscription(oldId, newData)` - Renew subscription

### 4. PackageService (`packageService.ts`)
- `getPackagesByGym(gymId)` - Get all packages
- `getActivePackages(gymId)` - Get active packages only
- `getPackageById(id)` - Get single package
- `createPackage(data)` - Create package
- `updatePackage(id, updates)` - Update package
- `deletePackage(id)` - Delete package
- `togglePackageStatus(id, isActive)` - Toggle active status

### 5. InvoiceService (`invoiceService.ts`)
- `getInvoicesByGym(gymId)` - Get all invoices
- `getInvoicesByMember(memberId)` - Get member's invoices
- `getInvoiceById(id)` - Get single invoice
- `getPendingInvoices(gymId)` - Get pending invoices
- `getOverdueInvoices(gymId)` - Get overdue invoices
- `createInvoice(data)` - Create invoice (auto-generates invoice #)
- `updateInvoice(id, updates)` - Update invoice
- `markInvoiceAsPaid(id, method)` - Mark as paid
- `cancelInvoice(id)` - Cancel invoice
- `updateOverdueInvoices(gymId)` - Update overdue status

### 6. TrainerService (`trainerService.ts`)
- `getTrainersByGym(gymId)` - Get all trainers
- `getActiveTrainers(gymId)` - Get active trainers only
- `getTrainerById(id)` - Get single trainer
- `getTrainerByUserId(userId)` - For trainer portal
- `getTrainerWithMembers(id)` - Get trainer with assigned members
- `createTrainer(data)` - Create trainer
- `updateTrainer(id, updates)` - Update trainer
- `deleteTrainer(id)` - Delete trainer
- `uploadPhoto(id, file)` - Upload trainer photo
- `deletePhoto(url)` - Delete trainer photo
- `toggleTrainerStatus(id, isActive)` - Toggle active status

### 7. AttendanceService (`attendanceService.ts`)
- `getAttendanceByGym(gymId)` - Get all attendance logs
- `getAttendanceByMember(memberId)` - Get member's attendance
- `getTodayAttendance(gymId)` - Get today's logs
- `getCurrentlyCheckedIn(gymId)` - Get currently checked-in members
- `checkIn(gymId, memberId, userId, device)` - Check in member
- `checkOut(attendanceId)` - Check out member
- `getAttendanceStats(gymId, start, end)` - Get statistics
- `getLatestAttendance(memberId)` - Get member's latest log

### 8. TransactionService (`transactionService.ts`)
- `getTransactionsByGym(gymId)` - Get all transactions
- `getTransactionsByMember(memberId)` - Get member's transactions
- `getTransactionsByInvoice(invoiceId)` - Get invoice transactions
- `createTransaction(data)` - Create transaction
- `getTransactionsByDateRange(gymId, start, end)` - Get by date range
- `getTotalRevenue(gymId, start?, end?)` - Calculate total revenue

### 9. UserRoleService (`userRoleService.ts`)
- `getUserRoles(userId)` - Get user's roles
- `hasRole(userId, role)` - Check if user has role
- `assignRole(data)` - Assign role to user
- `removeRole(userId, role, gymId?)` - Remove role
- `removeAllUserRoles(userId)` - Remove all roles
- `getUsersByRole(gymId, role)` - Get users with specific role
- `getUserGymId(userId)` - Get user's gym ID

### 10. ProfileService (`profileService.ts`)
- `getProfile(userId)` - Get user profile
- `getProfilesByGym(gymId)` - Get all profiles in gym
- `createProfile(data)` - Create profile
- `updateProfile(userId, updates)` - Update profile
- `deleteProfile(userId)` - Delete profile
- `uploadAvatar(userId, file)` - Upload avatar

### 11. AuthService (`authService.ts`)
- `signUp(...)` - Sign up new user with gym creation
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out current user
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update password
- `deleteUser(userId)` - Delete user (admin)

## Components Updated

All components have been successfully refactored to use the service layer:

### ✅ All Dialog Components Migrated
- All Add/Edit/Delete dialogs now use appropriate services

### ✅ All Page Components Migrated
- `Members.tsx` - Uses MemberService
- `Trainers.tsx` - Uses TrainerService
- `Packages.tsx` - Uses PackageService
- `Subscriptions.tsx` - Uses SubscriptionService
- `Invoices.tsx` - Uses InvoiceService
- `Attendance.tsx` - Uses AttendanceService, MemberService
- `Staff.tsx` - Uses UserRoleService, ProfileService
- `MemberPortal.tsx` - Uses MemberService, SubscriptionService, InvoiceService, AttendanceService
- `TrainerPortal.tsx` - Uses TrainerService, SubscriptionService, AttendanceService
- `MemberDetail.tsx` - Uses MemberService, SubscriptionService, AttendanceService

### ✅ Dashboard Components Migrated
- `KPICards.tsx` - Uses MemberService, SubscriptionService, AttendanceService, TransactionService
- `RecentActivity.tsx` - Uses AttendanceService, SubscriptionService

### ✅ Report Pages Migrated
- `Reports.tsx` - Uses all services for comprehensive reporting
- `ReportAttendance.tsx` - Uses AttendanceService
- `ReportPayments.tsx` - Uses InvoiceService

## Benefits

### 1. **Separation of Concerns**
- Components focus on UI rendering
- Services handle data operations
- Clear boundaries between layers

### 2. **Code Reusability**
- Services can be used across multiple components
- No duplicate database queries
- Consistent data access patterns

### 3. **Easier Testing**
- Services can be mocked in component tests
- Database logic can be tested independently
- Simpler unit tests

### 4. **Better Error Handling**
- Centralized error handling in services
- Consistent error messages
- Easier to add logging/monitoring

### 5. **Type Safety**
- All services use TypeScript types from Supabase
- IntelliSense support
- Compile-time error checking

### 6. **Maintainability**
- Easy to find and update database queries
- Changes to database schema require updates in one place
- Clear file structure

## Migration Steps for Remaining Components

To migrate a component to use services:

1. **Identify Supabase calls**
   ```tsx
   // Find these patterns:
   supabase.from('table_name')...
   supabase.auth...
   supabase.storage...
   ```

2. **Import the appropriate service**
   ```tsx
   import { MemberService } from '@/services/memberService';
   ```

3. **Replace the Supabase call**
   ```tsx
   // Before
   const { data, error } = await supabase
     .from('members')
     .select('*')
     .eq('gym_id', gymId);
   
   // After
   const data = await MemberService.getMembersByGym(gymId);
   ```

4. **Update error handling**
   ```tsx
   try {
     const result = await MemberService.createMember(formData);
     toast.success('Member created');
   } catch (error: any) {
     toast.error(error.message || 'Failed to create member');
   }
   ```

5. **Test thoroughly**
   - Verify all CRUD operations work
   - Check error handling
   - Ensure data displays correctly

## Next Steps

1. ✅ Service layer created
2. ✅ All dialog components refactored
3. ✅ All page components refactored
4. ✅ All dashboard components refactored
5. ✅ Documentation added
6. ⏳ Add service tests (optional)
7. ⏳ Performance optimization (optional)

## Notes

- All services use static methods (no instantiation needed)
- Services throw errors - components must catch them
- Services return typed data from Supabase
- Always use React Query for data fetching in components
- Invalidate queries after mutations

## Questions?

Refer to `/src/services/README.md` for detailed service documentation and usage examples.
