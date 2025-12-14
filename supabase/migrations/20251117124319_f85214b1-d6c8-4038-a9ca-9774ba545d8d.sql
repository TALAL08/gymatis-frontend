-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('system_admin', 'gym_admin', 'staff', 'trainer');

-- Create member status enum
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'suspended');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Create invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'other');

-- Create gender enum
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');

-- ============================================
-- CORE TABLES
-- ============================================

-- Gyms table (tenants)
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table (extends auth.users with additional info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  cnic TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, gym_id)
);

-- Members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  member_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cnic TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender public.gender,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  photo_url TEXT,
  status public.member_status NOT NULL DEFAULT 'active',
  notes TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, member_code)
);

-- Trainers table
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialties TEXT[],
  bio TEXT,
  price_per_session DECIMAL(10,2),
  monthly_addon_price DECIMAL(10,2),
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages table (subscription plans)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  visits_limit INTEGER,
  allows_trainer_addon BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member subscriptions
CREATE TABLE public.member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE RESTRICT NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  trainer_addon_price DECIMAL(10,2) DEFAULT 0,
  status public.subscription_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.member_subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method public.payment_method,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, invoice_number)
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  reference_number TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance logs table
CREATE TABLE public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discounts table
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, code)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_gym_id ON public.profiles(gym_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_members_gym_id ON public.members(gym_id);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_trainers_gym_id ON public.trainers(gym_id);
CREATE INDEX idx_packages_gym_id ON public.packages(gym_id);
CREATE INDEX idx_member_subscriptions_gym_id ON public.member_subscriptions(gym_id);
CREATE INDEX idx_member_subscriptions_member_id ON public.member_subscriptions(member_id);
CREATE INDEX idx_member_subscriptions_status ON public.member_subscriptions(status);
CREATE INDEX idx_invoices_gym_id ON public.invoices(gym_id);
CREATE INDEX idx_invoices_member_id ON public.invoices(member_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_transactions_gym_id ON public.transactions(gym_id);
CREATE INDEX idx_transactions_invoice_id ON public.transactions(invoice_id);
CREATE INDEX idx_attendance_logs_gym_id ON public.attendance_logs(gym_id);
CREATE INDEX idx_attendance_logs_member_id ON public.attendance_logs(member_id);
CREATE INDEX idx_attendance_logs_check_in_at ON public.attendance_logs(check_in_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's gym_id
CREATE OR REPLACE FUNCTION public.get_user_gym_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on gyms
CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on members
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on trainers
CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on packages
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on member_subscriptions
CREATE TRIGGER update_member_subscriptions_updated_at
  BEFORE UPDATE ON public.member_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on discounts
CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON public.discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Gyms policies
CREATE POLICY "System admins can view all gyms"
  ON public.gyms FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "Gym users can view their own gym"
  ON public.gyms FOR SELECT
  TO authenticated
  USING (id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "System admins can insert gyms"
  ON public.gyms FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "System admins can update all gyms"
  ON public.gyms FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'system_admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their gym"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Gym admins can view roles in their gym"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gym_admin') AND
    gym_id = public.get_user_gym_id(auth.uid())
  );

CREATE POLICY "System admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'system_admin'));

-- Members policies
CREATE POLICY "Gym users can view members in their gym"
  ON public.members FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins and staff can insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

CREATE POLICY "Gym admins and staff can update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

CREATE POLICY "Gym admins can delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    public.has_role(auth.uid(), 'gym_admin')
  );

-- Trainers policies
CREATE POLICY "Gym users can view trainers in their gym"
  ON public.trainers FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins can manage trainers"
  ON public.trainers FOR ALL
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    public.has_role(auth.uid(), 'gym_admin')
  );

-- Packages policies
CREATE POLICY "Gym users can view packages in their gym"
  ON public.packages FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins can manage packages"
  ON public.packages FOR ALL
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    public.has_role(auth.uid(), 'gym_admin')
  );

-- Member subscriptions policies
CREATE POLICY "Gym users can view subscriptions in their gym"
  ON public.member_subscriptions FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins and staff can manage subscriptions"
  ON public.member_subscriptions FOR ALL
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

-- Invoices policies
CREATE POLICY "Gym users can view invoices in their gym"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins and staff can manage invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

-- Transactions policies
CREATE POLICY "Gym users can view transactions in their gym"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins and staff can insert transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

-- Attendance logs policies
CREATE POLICY "Gym users can view attendance in their gym"
  ON public.attendance_logs FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym users can insert attendance logs"
  ON public.attendance_logs FOR INSERT
  TO authenticated
  WITH CHECK (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins and staff can update attendance"
  ON public.attendance_logs FOR UPDATE
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'gym_admin') OR public.has_role(auth.uid(), 'staff'))
  );

-- Discounts policies
CREATE POLICY "Gym users can view discounts in their gym"
  ON public.discounts FOR SELECT
  TO authenticated
  USING (gym_id = public.get_user_gym_id(auth.uid()));

CREATE POLICY "Gym admins can manage discounts"
  ON public.discounts FOR ALL
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid()) AND
    public.has_role(auth.uid(), 'gym_admin')
  );