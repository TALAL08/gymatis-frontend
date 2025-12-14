-- Update the handle_new_user function to create gym and assign gym_admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_gym_id uuid;
BEGIN
  -- Extract gym information from user metadata
  IF NEW.raw_user_meta_data ? 'gym_name' THEN
    -- Create the gym
    INSERT INTO public.gyms (name, location, phone, email, address)
    VALUES (
      NEW.raw_user_meta_data->>'gym_name',
      COALESCE(NEW.raw_user_meta_data->>'gym_location', ''),
      COALESCE(NEW.raw_user_meta_data->>'gym_phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'gym_email', ''),
      COALESCE(NEW.raw_user_meta_data->>'gym_address', '')
    )
    RETURNING id INTO new_gym_id;

    -- Create the user profile with gym_id
    INSERT INTO public.profiles (id, first_name, last_name, phone, gym_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      new_gym_id
    );

    -- Assign gym_admin role
    INSERT INTO public.user_roles (user_id, role, gym_id)
    VALUES (NEW.id, 'gym_admin'::app_role, new_gym_id);
  ELSE
    -- Fallback: Create profile without gym (for existing flow)
    INSERT INTO public.profiles (id, first_name, last_name, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
  END IF;

  RETURN NEW;
END;
$$;