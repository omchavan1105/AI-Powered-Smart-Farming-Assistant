import { supabase } from '../lib/supabase';

// Static catalog fallback for crop specifications
const CROP_CATALOG = {
  "Tomato": { scientificName: "Solanum lycopersicum", season: "Kharif, Rabi, Zaid", duration: "90-120 days", waterRequirement: "High (600-800 mm)", soilType: "Well-drained sandy loam", phRange: "6.0 - 7.0" },
  "Onion": { scientificName: "Allium cepa", season: "Rabi", duration: "100-120 days", waterRequirement: "Medium (400-600 mm)", soilType: "Sandy loam to clay loam", phRange: "6.5 - 7.5" },
  "Soybean": { scientificName: "Glycine max", season: "Kharif", duration: "90-110 days", waterRequirement: "Medium (500-750 mm)", soilType: "Well-drained loam", phRange: "6.0 - 6.5" },
  "Cotton": { scientificName: "Gossypium", season: "Kharif", duration: "150-180 days", waterRequirement: "High (700-1200 mm)", soilType: "Deep black soil", phRange: "5.5 - 8.5" }
};

export const cropService = {
  getCropDetails: async (cropName) => {
    const name = cropName || "Tomato";
    if (CROP_CATALOG[name]) {
      return { name, ...CROP_CATALOG[name] };
    }
    return {
      name,
      scientificName: "Unknown",
      season: "Seasonal",
      duration: "90-120 days",
      waterRequirement: "Moderate",
      soilType: "Loamy soil",
      phRange: "6.0 - 7.5"
    };
  },
  
  getRecommendations: async (context) => {
    return [
      { crop: "Tomato", score: 92, reason: "Matches your soil type and current season." },
      { crop: "Onion", score: 87, reason: "Good market demand, suitable for your water availability." },
      { crop: "Soybean", score: 84, reason: "Optimal nitrogen fixing, fits current moisture profile." },
      { crop: "Cotton", score: 79, reason: "High profit potential for deep black soils." }
    ];
  },

  // Farmer Crops CRUD (Supabase database)
  getFarmerCrops: async (farmerId) => {
    if (!farmerId) return [];
    const { data, error } = await supabase
      .from('farmer_crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching farmer crops:", error);
      return [];
    }
    return data || [];
  },

  addFarmerCrop: async (cropData) => {
    const { data, error } = await supabase
      .from('farmer_crops')
      .insert({
        farmer_id: cropData.farmerId,
        crop_name: cropData.cropName,
        season: cropData.season,
        sowing_date: cropData.sowingDate || null,
        expected_harvest_date: cropData.expectedHarvestDate || null,
        status: cropData.status || 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateFarmerCrop: async (cropId, updates) => {
    const { data, error } = await supabase
      .from('farmer_crops')
      .update(updates)
      .eq('id', cropId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteFarmerCrop: async (cropId) => {
    const { error } = await supabase
      .from('farmer_crops')
      .delete()
      .eq('id', cropId);

    if (error) throw error;
    return true;
  }
};
