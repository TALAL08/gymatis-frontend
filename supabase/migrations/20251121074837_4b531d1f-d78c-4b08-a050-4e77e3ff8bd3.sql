-- Allow gym admins to insert user roles for their gym
CREATE POLICY "Gym admins can insert roles in their gym"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'gym_admin'::app_role) 
  AND gym_id = get_user_gym_id(auth.uid())
);