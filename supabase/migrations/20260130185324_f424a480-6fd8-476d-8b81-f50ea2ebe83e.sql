-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fields table
CREATE TABLE public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    area_hectares DECIMAL(10, 2),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zones table (subdivisions of fields)
CREATE TABLE public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    area_hectares DECIMAL(10, 2),
    grass_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create robots table
CREATE TABLE public.robots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    model TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'idle', 'offline', 'maintenance')),
    battery_level INTEGER DEFAULT 0 CHECK (battery_level >= 0 AND battery_level <= 100),
    current_task TEXT,
    current_field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    current_zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor_readings table for historical data
CREATE TABLE public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID REFERENCES public.robots(id) ON DELETE CASCADE NOT NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    temperature DECIMAL(5, 2),
    soil_moisture DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    grass_growth_index DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    gps_latitude DECIMAL(10, 7),
    gps_longitude DECIMAL(10, 7),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_configurations table
CREATE TABLE public.admin_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, key)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_configurations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Create function to check if user owns field
CREATE OR REPLACE FUNCTION public.owns_field(_field_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fields
    WHERE id = _field_id
      AND user_id = auth.uid()
  )
$$;

-- Create function to check if user owns robot
CREATE OR REPLACE FUNCTION public.owns_robot(_robot_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.robots
    WHERE id = _robot_id
      AND user_id = auth.uid()
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for fields
CREATE POLICY "Users can view their own fields"
ON public.fields FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create their own fields"
ON public.fields FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own fields"
ON public.fields FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own fields"
ON public.fields FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for zones
CREATE POLICY "Users can view zones in their fields"
ON public.zones FOR SELECT
TO authenticated
USING (public.owns_field(field_id) OR public.is_admin());

CREATE POLICY "Users can create zones in their fields"
ON public.zones FOR INSERT
TO authenticated
WITH CHECK (public.owns_field(field_id));

CREATE POLICY "Users can update zones in their fields"
ON public.zones FOR UPDATE
TO authenticated
USING (public.owns_field(field_id));

CREATE POLICY "Users can delete zones in their fields"
ON public.zones FOR DELETE
TO authenticated
USING (public.owns_field(field_id));

-- RLS Policies for robots
CREATE POLICY "Users can view their own robots"
ON public.robots FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create their own robots"
ON public.robots FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own robots"
ON public.robots FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own robots"
ON public.robots FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for sensor_readings
CREATE POLICY "Users can view readings from their robots"
ON public.sensor_readings FOR SELECT
TO authenticated
USING (public.owns_robot(robot_id) OR public.is_admin());

CREATE POLICY "Users can insert readings for their robots"
ON public.sensor_readings FOR INSERT
TO authenticated
WITH CHECK (public.owns_robot(robot_id));

-- RLS Policies for admin_configurations
CREATE POLICY "Users can view their own configurations"
ON public.admin_configurations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own configurations"
ON public.admin_configurations FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_zones_updated_at
    BEFORE UPDATE ON public.zones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_robots_updated_at
    BEFORE UPDATE ON public.robots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_admin_configurations_updated_at
    BEFORE UPDATE ON public.admin_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to make first user an admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.user_roles;
    IF user_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, 'admin');
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, 'user');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_set_role
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_first_admin();

-- Create indexes for performance
CREATE INDEX idx_sensor_readings_robot_id ON public.sensor_readings(robot_id);
CREATE INDEX idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at DESC);
CREATE INDEX idx_sensor_readings_field_id ON public.sensor_readings(field_id);
CREATE INDEX idx_zones_field_id ON public.zones(field_id);
CREATE INDEX idx_robots_user_id ON public.robots(user_id);
CREATE INDEX idx_fields_user_id ON public.fields(user_id);

-- Enable realtime for sensor_readings
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;