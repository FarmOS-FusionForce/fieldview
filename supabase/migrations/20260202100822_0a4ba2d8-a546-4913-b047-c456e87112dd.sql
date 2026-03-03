-- Add farmer onboarding data to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_region text,
ADD COLUMN IF NOT EXISTS observed_weather text,
ADD COLUMN IF NOT EXISTS farming_type text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create file uploads table for admin
CREATE TABLE public.file_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    data jsonb NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on file_uploads
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Only admins can manage file uploads
CREATE POLICY "Admins can manage file uploads" 
ON public.file_uploads 
FOR ALL 
USING (is_admin());

-- Farmers can view file data (read only)
CREATE POLICY "Farmers can view file uploads" 
ON public.file_uploads 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create crops table with default data
CREATE TABLE public.crops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    profitability_rank integer,
    season text,
    growing_period text,
    water_requirement text,
    is_default boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Everyone can view crops
CREATE POLICY "Anyone can view crops" 
ON public.crops 
FOR SELECT 
USING (true);

-- Only admins can modify crops
CREATE POLICY "Admins can manage crops" 
ON public.crops 
FOR ALL 
USING (is_admin());

-- Insert default top-10 profitable crops
INSERT INTO public.crops (name, description, profitability_rank, season, growing_period, water_requirement, is_default) VALUES
('Tomato', 'High-demand vegetable crop with excellent market value', 1, 'Summer', '60-90 days', 'Moderate', true),
('Onion', 'Essential kitchen staple with steady demand', 2, 'Winter', '90-120 days', 'Low', true),
('Potato', 'Versatile crop with high yield potential', 3, 'Winter', '90-120 days', 'Moderate', true),
('Chili Pepper', 'Spicy crop with premium pricing', 4, 'Summer', '60-90 days', 'Moderate', true),
('Banana', 'Perennial fruit with continuous harvest', 5, 'Year-round', '12-15 months', 'High', true),
('Mango', 'Premium fruit with export potential', 6, 'Summer', '3-6 years', 'Moderate', true),
('Grapes', 'High-value crop for fresh and wine markets', 7, 'Summer', '2-3 years', 'Moderate', true),
('Pomegranate', 'Superfruit with rising demand', 8, 'Year-round', '2-3 years', 'Low', true),
('Papaya', 'Fast-growing tropical fruit', 9, 'Year-round', '9-12 months', 'High', true),
('Watermelon', 'High-demand summer fruit', 10, 'Summer', '70-90 days', 'High', true);

-- Create weather data table for caching
CREATE TABLE public.weather_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    location text NOT NULL,
    real_time_data jsonb,
    predictive_data jsonb,
    ai_explanation text,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on weather_data
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own weather data
CREATE POLICY "Users can view their weather data" 
ON public.weather_data 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can manage their weather data
CREATE POLICY "Users can manage their weather data" 
ON public.weather_data 
FOR ALL 
USING (user_id = auth.uid());

-- Enable realtime for file_uploads and weather_data
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_uploads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;

-- Add updated_at triggers
CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_weather_data_updated_at
    BEFORE UPDATE ON public.weather_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();