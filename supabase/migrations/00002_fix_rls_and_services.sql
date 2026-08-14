-- Migration: 00002_fix_rls_and_services.sql
-- Description: Fix RLS policies on yield_predictions and recommendations, add updated_at trigger

-- 1. Drop restricted SELECT-only policies
DROP POLICY IF EXISTS "Users can view own yield predictions" ON public.yield_predictions;
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;

-- 2. Create full management policies for authenticated farmers
CREATE POLICY "Users can manage own yield predictions" 
ON public.yield_predictions 
FOR ALL 
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Users can manage own recommendations" 
ON public.recommendations 
FOR ALL 
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

-- 3. Trigger for auto-updating updated_at on farmer_profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_farmer_profiles_updated_at ON public.farmer_profiles;
CREATE TRIGGER set_farmer_profiles_updated_at
BEFORE UPDATE ON public.farmer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
