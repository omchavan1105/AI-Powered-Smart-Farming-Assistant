-- 1. Create tables

CREATE TABLE public.farmer_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  village TEXT,
  district TEXT,
  state TEXT,
  farm_size_acres NUMERIC,
  soil_type TEXT,
  irrigation_type TEXT,
  farming_experience_years INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.farmer_crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT,
  sowing_date DATE,
  expected_harvest_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.soil_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  ph_level NUMERIC,
  nitrogen NUMERIC,
  phosphorus NUMERIC,
  potassium NUMERIC,
  moisture_level NUMERIC,
  tested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.weather_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  temperature NUMERIC,
  humidity NUMERIC,
  rainfall NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.market_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  state TEXT,
  min_price NUMERIC,
  max_price NUMERIC,
  modal_price NUMERIC,
  recorded_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE public.disease_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  detected_disease TEXT,
  confidence_score NUMERIC,
  severity TEXT,
  recommended_action TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  type TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.government_schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  application_link TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.yield_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.farmer_crops(id) ON DELETE SET NULL,
  predicted_yield_kg NUMERIC,
  confidence_score NUMERIC,
  predicted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Farmer Profiles: User can only read and update their own profile
CREATE POLICY "Users can view own profile" ON public.farmer_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.farmer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.farmer_profiles FOR UPDATE USING (auth.uid() = id);

-- Farmer Crops: User can only read and manage their own crops
CREATE POLICY "Users can manage own crops" ON public.farmer_crops FOR ALL USING (auth.uid() = farmer_id);

-- Soil Records: User can only read and manage their own soil records
CREATE POLICY "Users can manage own soil records" ON public.soil_records FOR ALL USING (auth.uid() = farmer_id);

-- Disease Detections: User can only read and manage their own detections
CREATE POLICY "Users can manage own disease detections" ON public.disease_detections FOR ALL USING (auth.uid() = farmer_id);

-- AI Conversations & Messages: User can only manage their own conversations
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Users can manage own messages" ON public.ai_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ai_conversations WHERE id = ai_messages.conversation_id AND farmer_id = auth.uid()
  )
);

-- Recommendations: User can read their own recommendations
CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = farmer_id);

-- Yield Predictions: User can view their own predictions
CREATE POLICY "Users can view own yield predictions" ON public.yield_predictions FOR SELECT USING (auth.uid() = farmer_id);

-- Alerts: User can view and update their own alerts
CREATE POLICY "Users can manage own alerts" ON public.alerts FOR ALL USING (auth.uid() = farmer_id);

-- Public read-only tables (No RLS for reads, or RLS enabled but open for read)
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read weather" ON public.weather_records FOR SELECT USING (true);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read market prices" ON public.market_prices FOR SELECT USING (true);

ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read government schemes" ON public.government_schemes FOR SELECT USING (true);
