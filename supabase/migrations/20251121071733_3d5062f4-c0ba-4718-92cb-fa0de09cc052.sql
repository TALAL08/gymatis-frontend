-- Create security definer functions to avoid RLS recursion

-- Function to check if a member belongs to a user
CREATE OR REPLACE FUNCTION public.is_users_member(_member_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members
    WHERE id = _member_id AND user_id = _user_id
  )
$$;

-- Function to check if a trainer is assigned to a member
CREATE OR REPLACE FUNCTION public.is_trainer_assigned_to_member(_trainer_user_id uuid, _member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.member_subscriptions ms
    INNER JOIN public.trainers t ON ms.trainer_id = t.id
    WHERE t.user_id = _trainer_user_id AND ms.member_id = _member_id
  )
$$;

-- Function to check if a subscription belongs to a user's member profile
CREATE OR REPLACE FUNCTION public.is_users_subscription(_subscription_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.member_subscriptions ms
    INNER JOIN public.members m ON ms.member_id = m.id
    WHERE ms.id = _subscription_id AND m.user_id = _user_id
  )
$$;

-- Drop existing recursive policies on members table
DROP POLICY IF EXISTS "Members can view their own profile" ON public.members;
DROP POLICY IF EXISTS "Trainers can view assigned members" ON public.members;

-- Recreate policies using security definer functions
CREATE POLICY "Members can view their own profile"
ON public.members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Trainers can view assigned members"
ON public.members
FOR SELECT
USING (is_trainer_assigned_to_member(auth.uid(), id));

-- Drop existing recursive policies on member_subscriptions table
DROP POLICY IF EXISTS "Members can view their own subscriptions" ON public.member_subscriptions;
DROP POLICY IF EXISTS "Trainers can view assigned member subscriptions" ON public.member_subscriptions;

-- Recreate policies using security definer functions
CREATE POLICY "Members can view their own subscriptions"
ON public.member_subscriptions
FOR SELECT
USING (is_users_subscription(id, auth.uid()));

CREATE POLICY "Trainers can view assigned member subscriptions"
ON public.member_subscriptions
FOR SELECT
USING (trainer_id IN (
  SELECT id FROM public.trainers WHERE user_id = auth.uid()
));

-- Drop existing recursive policies on attendance_logs table
DROP POLICY IF EXISTS "Members can view their own attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Trainers can view assigned member attendance" ON public.attendance_logs;

-- Recreate policies using security definer functions
CREATE POLICY "Members can view their own attendance"
ON public.attendance_logs
FOR SELECT
USING (is_users_member(member_id, auth.uid()));

CREATE POLICY "Trainers can view assigned member attendance"
ON public.attendance_logs
FOR SELECT
USING (is_trainer_assigned_to_member(auth.uid(), member_id));

-- Drop existing recursive policies on invoices table
DROP POLICY IF EXISTS "Members can view their own invoices" ON public.invoices;

-- Recreate policy using security definer function
CREATE POLICY "Members can view their own invoices"
ON public.invoices
FOR SELECT
USING (is_users_member(member_id, auth.uid()));

-- Drop existing recursive policy on transactions table
DROP POLICY IF EXISTS "Members can view their own transactions" ON public.transactions;

-- Recreate policy using security definer function
CREATE POLICY "Members can view their own transactions"
ON public.transactions
FOR SELECT
USING (invoice_id IN (
  SELECT id FROM public.invoices WHERE is_users_member(member_id, auth.uid())
));