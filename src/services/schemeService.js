import { supabase } from '../lib/supabase';

const FALLBACK_SCHEMES = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Direct income support of ₹6,000 per year in three equal 4-monthly installments to all landholding farmer families.",
    eligibility: "Small and marginal farmers with cultivable land",
    benefits: "₹6,000 / year direct transfer",
    link: "https://pmkisan.gov.in/"
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    description: "Comprehensive crop insurance scheme providing financial support and risk cover to farmers suffering crop loss or damage due to natural calamities.",
    eligibility: "All farmers growing notified crops in notified areas",
    benefits: "Low premium (1.5% - 2%) with full sum insured coverage",
    link: "https://pmfby.gov.in/"
  },
  {
    name: "KCC (Kisan Credit Card Scheme)",
    description: "Timely and affordable credit to farmers for their agricultural and other needs like purchase of seeds, fertilizers, and machinery.",
    eligibility: "Individual / Joint farmers, tenant farmers, SHGs",
    benefits: "Low-interest loans up to ₹3 Lakhs @ 4% subsidized interest",
    link: "https://myscheme.gov.in/"
  },
  {
    name: "Soil Health Card Scheme",
    description: "Provides soil health cards to farmers every 2 years with crop-wise nutrient and fertilizer recommendations.",
    eligibility: "All farmers across India",
    benefits: "Free soil testing and customized fertilizer advisory",
    link: "https://soilhealth.dac.gov.in/"
  }
];

export const schemeService = {
  getGovernmentSchemes: async () => {
    try {
      const { data, error } = await supabase
        .from('government_schemes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          name: s.scheme_name,
          description: s.description,
          eligibility: s.eligibility,
          benefits: s.benefits,
          link: s.application_link || 'https://myscheme.gov.in/'
        }));
      }

      return FALLBACK_SCHEMES;
    } catch (err) {
      console.warn("Could not query government_schemes from DB, using official fallback:", err);
      return FALLBACK_SCHEMES;
    }
  }
};
