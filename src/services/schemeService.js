import { supabase } from '../lib/supabase';

const OFFICIAL_GOVERNMENT_SCHEMES = [
  {
    id: 'pm-kisan',
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Direct Income Support",
    state: "All India",
    description: "Direct income support of ₹6,000 per year in three equal 4-monthly installments to all eligible landholding farmer families across India.",
    eligibility: "Small and marginal farmers with cultivable land in their name. Subject to exclusion criteria (institutional landholders, high-income taxpayers).",
    benefits: "₹6,000 / year direct transfer to Aadhaar-linked bank account",
    link: "https://pmkisan.gov.in/"
  },
  {
    id: 'pmfby',
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    category: "Crop Insurance",
    state: "All India",
    description: "Comprehensive crop insurance scheme providing comprehensive financial support and risk cover to farmers against non-preventable natural risks from pre-sowing to post-harvest.",
    eligibility: "All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.",
    benefits: "Low premium rate: 1.5% for Rabi, 2% for Kharif, 5% for commercial/horticultural crops with full sum insured claim coverage.",
    link: "https://pmfby.gov.in/"
  },
  {
    id: 'kcc',
    name: "Kisan Credit Card (KCC) Scheme",
    category: "Credit & Loans",
    state: "All India",
    description: "Adequate and timely credit support from the banking system to farmers for cultivation expenses, post-harvest expenses, produce marketing, and farm maintenance.",
    eligibility: "All farmers — individual / joint borrowers, tenant farmers, oral lessees, and Self Help Groups (SHGs).",
    benefits: "Credit limit up to ₹3 Lakhs at an effective 4% interest rate (with 3% prompt repayment incentive). No collateral up to ₹1.6 Lakhs.",
    link: "https://myscheme.gov.in/schemes/kcc"
  },
  {
    id: 'soil-health-card',
    name: "Soil Health Card Scheme",
    category: "Soil & Testing",
    state: "All India",
    description: "Issues soil health cards to farmers periodically with crop-wise nutrient and fertilizer recommendations to improve productivity through balanced fertilizer use.",
    eligibility: "All farmers across all Indian states and Union Territories.",
    benefits: "Free soil testing and customized NPK & micro-nutrient advisory every 2 years.",
    link: "https://soilhealth.dac.gov.in/"
  },
  {
    id: 'pmksy',
    name: "PMKSY (Per Drop More Crop - Micro Irrigation)",
    category: "Irrigation Subsidy",
    state: "All India",
    description: "Financial assistance for installing micro-irrigation systems (Drip and Sprinkler) to enhance water use efficiency and crop yield.",
    eligibility: "All landowning farmers, cooperative members, and registered farmer producer organizations (FPOs).",
    benefits: "Subsidy of up to 55% for small/marginal farmers and 45% for other farmers on micro-irrigation system cost.",
    link: "https://pmksy.gov.in/"
  },
  {
    id: 'smam',
    name: "SMAM (Sub-Mission on Agricultural Mechanization)",
    category: "Machinery Subsidy",
    state: "All India",
    description: "Promotes farm mechanization among small and marginal farmers and establishes Custom Hiring Centres (CHCs) in rural areas.",
    eligibility: "Individual farmers, Farmer Producer Organizations (FPOs), Cooperative societies, and SHGs.",
    benefits: "40% to 50% financial subsidy on procurement of tractors, power tillers, seed drills, and harvesting equipment.",
    link: "https://agrimachinery.nic.in/"
  },
  {
    id: 'pkvy',
    name: "PKVY (Paramparagat Krishi Vikas Yojana)",
    category: "Organic Farming",
    state: "All India",
    description: "Encourages cluster-based organic farming with PGS certification, supporting sustainable soil biology and premium organic market linkages.",
    eligibility: "Farmers willing to form clusters of 20-50 hectares for certified organic cultivation.",
    benefits: "Financial assistance of ₹50,000 per hectare for 3 years (including inputs, certification, and packaging).",
    link: "https://pgsindia-ncof.gov.in/"
  },
  {
    id: 'maha-solar',
    name: "Maha Solar Pump Yojana / Kusuma Component B",
    category: "Solar & Energy",
    state: "Maharashtra",
    description: "Provides standalone solar photovoltaic water pumping systems to farmers without conventional electricity connections.",
    eligibility: "Farmers with agricultural land and confirmed water source (borewell/well) in Maharashtra.",
    benefits: "Up to 90% subsidy on 3 HP, 5 HP, and 7.5 HP solar DC water pumps.",
    link: "https://www.mahadiscom.in/solar-mskvy/"
  }
];

export const schemeService = {
  /**
   * Get government schemes from database or official verified baseline, optionally filtered by state or category
   */
  getGovernmentSchemes: async (stateFilter = '', categoryFilter = '') => {
    try {
      let query = supabase
        .from('government_schemes')
        .select('*')
        .order('created_at', { ascending: true });

      if (stateFilter && stateFilter !== 'All' && stateFilter !== 'All India') {
        query = query.or(`state.eq.All India,state.ilike.%${stateFilter}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        let list = data.map(s => ({
          id: s.id,
          name: s.scheme_name,
          category: s.category || "General Agriculture",
          state: s.state || "All India",
          description: s.description,
          eligibility: s.eligibility,
          benefits: s.benefits,
          link: s.application_link || 'https://myscheme.gov.in/'
        }));

        if (categoryFilter && categoryFilter !== 'All') {
          list = list.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
        }

        return list;
      }

      // Return verified official fallback schemes
      return filterOfficialSchemes(stateFilter, categoryFilter);

    } catch (err) {
      console.warn("Could not query government_schemes from DB, using official verified catalog:", err);
      return filterOfficialSchemes(stateFilter, categoryFilter);
    }
  },

  getAvailableCategories: () => [
    'All',
    'Direct Income Support',
    'Crop Insurance',
    'Credit & Loans',
    'Soil & Testing',
    'Irrigation Subsidy',
    'Machinery Subsidy',
    'Organic Farming',
    'Solar & Energy'
  ]
};

function filterOfficialSchemes(stateFilter, categoryFilter) {
  let list = [...OFFICIAL_GOVERNMENT_SCHEMES];

  if (stateFilter && stateFilter !== 'All' && stateFilter !== 'All India') {
    list = list.filter(s => s.state === 'All India' || s.state.toLowerCase().includes(stateFilter.toLowerCase()));
  }

  if (categoryFilter && categoryFilter !== 'All') {
    list = list.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  return list;
}
