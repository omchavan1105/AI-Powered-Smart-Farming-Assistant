import { supabase } from '../lib/supabase';
import { generateSoilRecommendation, calculateSoilHealthScore } from './soilRecommendationEngine';

export const soilService = {
  saveSoilRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('soil_records')
      .insert({
        farmer_id: recordData.farmerId,
        ph_level: parseFloat(recordData.ph),
        nitrogen: parseFloat(recordData.nitrogen),
        phosphorus: parseFloat(recordData.phosphorus),
        potassium: parseFloat(recordData.potassium),
        moisture_level: parseFloat(recordData.moisture)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getLatestSoilRecord: async (farmerId) => {
    if (!farmerId) return null;
    try {
      const { data, error } = await supabase
        .from('soil_records')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('tested_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching latest soil record:", error);
      }
      return data || null;
    } catch (err) {
      return null;
    }
  },

  getSoilHistory: async (farmerId) => {
    if (!farmerId) return [];
    try {
      const { data, error } = await supabase
        .from('soil_records')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('tested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching soil history:", err);
      return [];
    }
  },

  /**
   * Evaluates soil data and generates ICAR-compliant recommendations
   */
  getSoilRecommendation: (soilData, cropName = 'General Crop') => {
    return generateSoilRecommendation(soilData, cropName);
  },

  /**
   * Computes health score from raw parameters
   */
  getHealthScore: (ph, nitrogen, phosphorus, potassium, moisture) => {
    return calculateSoilHealthScore(ph, nitrogen, phosphorus, potassium, moisture);
  }
};
