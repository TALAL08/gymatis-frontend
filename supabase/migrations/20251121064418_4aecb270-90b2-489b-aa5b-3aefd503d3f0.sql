-- Add user_id to members table to link with auth.users
ALTER TABLE public.members ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_members_user_id ON public.members(user_id);

-- Update RLS policies for members to view their own data
CREATE POLICY "Members can view their own profile"
ON public.members
FOR SELECT
USING (user_id = auth.uid());

-- Members can view their own subscriptions
CREATE POLICY "Members can view their own subscriptions"
ON public.member_subscriptions
FOR SELECT
USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- Members can view their own invoices
CREATE POLICY "Members can view their own invoices"
ON public.invoices
FOR SELECT
USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- Members can view their own attendance
CREATE POLICY "Members can view their own attendance"
ON public.attendance_logs
FOR SELECT
USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- Members can view their own transactions
CREATE POLICY "Members can view their own transactions"
ON public.transactions
FOR SELECT
USING (invoice_id IN (SELECT id FROM public.invoices WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())));

-- Trainers can view their own profile
CREATE POLICY "Trainers can view their own profile"
ON public.trainers
FOR SELECT
USING (user_id = auth.uid());

-- Trainers can update their own profile
CREATE POLICY "Trainers can update their own profile"
ON public.trainers
FOR UPDATE
USING (user_id = auth.uid());

-- Trainers can view members assigned to them
CREATE POLICY "Trainers can view assigned members"
ON public.members
FOR SELECT
USING (
  id IN (
    SELECT member_id 
    FROM public.member_subscriptions 
    WHERE trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  )
);

-- Trainers can view subscriptions of their assigned members
CREATE POLICY "Trainers can view assigned member subscriptions"
ON public.member_subscriptions
FOR SELECT
USING (trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()));

-- Trainers can view attendance of their assigned members
CREATE POLICY "Trainers can view assigned member attendance"
ON public.attendance_logs
FOR SELECT
USING (
  member_id IN (
    SELECT member_id 
    FROM public.member_subscriptions 
    WHERE trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  )
);

-- Staff can view members, packages, subscriptions in their gym
-- (already covered by existing gym_id based policies)

-- Members can view packages in their gym
CREATE POLICY "Members can view packages in their gym"
ON public.packages
FOR SELECT
USING (gym_id IN (SELECT gym_id FROM public.members WHERE user_id = auth.uid()));