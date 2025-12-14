-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true);

-- Create storage policies for member photos
CREATE POLICY "Gym users can view member photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'member-photos' AND 
       EXISTS (
         SELECT 1 FROM public.members
         WHERE members.gym_id = get_user_gym_id(auth.uid())
       ));

CREATE POLICY "Gym admins and staff can upload member photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'member-photos' AND
  (has_role(auth.uid(), 'gym_admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Gym admins and staff can update member photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'member-photos' AND
  (has_role(auth.uid(), 'gym_admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Gym admins can delete member photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'member-photos' AND
  has_role(auth.uid(), 'gym_admin'::app_role)
);