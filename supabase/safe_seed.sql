-- Create a script to seed initial reference data to Supabase safely (Idempotent)

-- Market Prices (DEMO/REFERENCE DATA)
INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Tomato', 'Pune APMC', 'Maharashtra', 4000, 5000, 4500, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Tomato' AND market_name = 'Pune APMC');

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Onion', 'Lasalgaon', 'Maharashtra', 2000, 2500, 2200, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Onion' AND market_name = 'Lasalgaon');

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Soybean', 'Latur', 'Maharashtra', 4100, 4300, 4200, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Soybean' AND market_name = 'Latur');

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Cotton', 'Amravati', 'Maharashtra', 7000, 7200, 7100, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Cotton' AND market_name = 'Amravati');

-- Government Schemes
INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'PM-KISAN', 'Financial benefit of ₹6000 per year in three equal installments to farmer families.', 'Small and marginal farmers', '₹6000/year', 'https://pmkisan.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name = 'PM-KISAN');

INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'Pradhan Mantri Fasal Bima Yojana', 'Crop insurance scheme to provide financial support to farmers suffering crop loss/damage.', 'All farmers growing notified crops', 'Insurance coverage against natural calamities', 'https://pmfby.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name = 'Pradhan Mantri Fasal Bima Yojana');
