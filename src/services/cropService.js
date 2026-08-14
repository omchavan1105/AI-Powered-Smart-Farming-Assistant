import { supabase } from '../lib/supabase';

// Mock catalog for initial seed/fallback if DB is empty
const CROP_CATALOG = {
  "Tomato": { scientificName: "Solanum lycopersicum", season: "Kharif, Rabi, Zaid", duration: "90-120 days", waterRequirement: "High (600-800 mm)", soilType: "Well-drained sandy loam", phRange: "6.0 - 7.0" },
  "Onion": { scientificName: "Allium cepa", season: "Rabi", duration: "100-120 days", waterRequirement: "Medium (400-600 mm)", soilType: "Sandy loam to clay loam", phRange: "6.5 - 7.5" },
  "Soybean": { scientificName: "Glycine max", season: "Kharif", duration: "90-110 days", waterRequirement: "Medium (500-750 mm)", soilType: "Well-drained loam", phRange: "6.0 - 6.5" },
  "Cotton": { scientificName: "Gossypium", season: "Kharif", duration: "150-180 days", waterRequirement: "High (700-1200 mm)", soilType: "Deep black soil", phRange: "5.5 - 8.5" }
};

export const cropService = {
  getCropDetails: async (cropName) => {
    // In a fully developed Phase 4, we would query a `crop_catalog` table.
    // For now, we simulate the database query with our local catalog dictionary.
    await new Promise(resolve => setTimeout(resolve, 300));
    const name = cropName || "Tomato";
    
    if (CROP_CATALOG[name]) {
      return { name, ...CROP_CATALOG[name] };
    }
    
    return {
      name: name,
      scientificName: "Unknown",
      season: "Unknown",
      duration: "Unknown",
      waterRequirement: "Unknown",
      soilType: "Unknown",
      phRange: "Unknown"
    };
  },
  
  getRecommendations: async (context) => {
    // In a fully developed Phase 4, this would call an Edge Function for ML-based recommendation.
    // For now, we return deterministic rule-based recommendations.
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { crop: "Tomato", score: 92, reason: "Matches your soil type and current season." },
      { crop: "Onion", score: 87, reason: "Good market demand, suitable for your water availability." },
      { crop: "Maize", score: 81, reason: "Secondary option, lower water requirement." }
    ];
  },

  getFarmerCrops: async (farmerId) => {
    if (!farmerId) return [];
    const { data, error } = await supabase
      .from('farmer_crops')
      .select('*')
      .eq('farmer_id', farmerId);
    
    if (error) {
      console.error("Error fetching farmer crops:", error);
      return [];
    }
    return data;
  }
};
