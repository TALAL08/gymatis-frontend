-- Create storage bucket for trainer photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-photos', 'trainer-photos', true);

-- Create RLS policies for trainer photos
CREATE POLICY "Gym users can view trainer photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'trainer-photos' AND (storage.foldername(name))[1] IN (
  SELECT gym_id::text FROM public.trainers WHERE gym_id = get_user_gym_id(auth.uid())
));

CREATE POLICY "Gym admins can upload trainer photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'trainer-photos' 
  AND has_role(auth.uid(), 'gym_admin')
  AND (storage.foldername(name))[1] = get_user_gym_id(auth.uid())::text
);

CREATE POLICY "Gym admins can update trainer photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'trainer-photos' 
  AND has_role(auth.uid(), 'gym_admin')
  AND (storage.foldername(name))[1] = get_user_gym_id(auth.uid())::text
);

CREATE POLICY "Gym admins can delete trainer photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'trainer-photos' 
  AND has_role(auth.uid(), 'gym_admin')
  AND (storage.foldername(name))[1] = get_user_gym_id(auth.uid())::text
);