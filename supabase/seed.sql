-- Create a script to seed initial reference data to Supabase safely (Idempotent)

-- Market Prices (Reference Data)
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

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Wheat', 'Khanna APMC', 'Punjab', 2275, 2350, 2300, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Wheat' AND market_name = 'Khanna APMC');

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Gram (Chana)', 'Indore APMC', 'Madhya Pradesh', 5800, 6200, 6000, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Gram (Chana)' AND market_name = 'Indore APMC');

INSERT INTO public.market_prices (crop_name, market_name, state, min_price, max_price, modal_price, recorded_date)
SELECT 'Rice (Paddy)', 'Karnal APMC', 'Haryana', 2183, 2300, 2250, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_prices WHERE crop_name = 'Rice (Paddy)' AND market_name = 'Karnal APMC');

-- Government Schemes
INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'PM-KISAN', 'Direct income support of ₹6000 per year in three equal 4-monthly installments to all landholding farmer families.', 'Small and marginal farmers with cultivable land', '₹6000/year direct transfer', 'https://pmkisan.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name = 'PM-KISAN');

INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'Comprehensive crop insurance scheme providing financial support and risk cover to farmers suffering crop loss or damage due to natural calamities.', 'All farmers growing notified crops in notified areas', 'Low premium (1.5% - 2%) with full sum insured coverage', 'https://pmfby.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name LIKE 'Pradhan Mantri Fasal Bima Yojana%');

INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'Kisan Credit Card (KCC)', 'Timely and affordable credit to farmers for agricultural and other needs like seeds, fertilizers, and equipment.', 'Individual/Joint farmers, tenant farmers, SHGs', 'Low-interest loans up to ₹3 Lakhs @ 4% subsidized rate', 'https://myscheme.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name LIKE 'Kisan Credit Card%');

INSERT INTO public.government_schemes (scheme_name, description, eligibility, benefits, application_link, state)
SELECT 'Soil Health Card Scheme', 'Provides soil health cards to farmers every 2 years with crop-wise nutrient and fertilizer recommendations.', 'All farmers across India', 'Free soil testing and customized fertilizer advisory', 'https://soilhealth.dac.gov.in/', 'All India'
WHERE NOT EXISTS (SELECT 1 FROM public.government_schemes WHERE scheme_name LIKE 'Soil Health Card%');
