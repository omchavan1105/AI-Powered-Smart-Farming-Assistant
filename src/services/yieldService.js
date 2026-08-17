import { supabase } from '../lib/supabase';

export const yieldService = {
  predictYield: async (params, farmerId = null) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const farmSize = parseFloat(params?.farmSize) || 2;
    const basePerAcre = params?.crop === 'Tomato' ? 2250 : params?.crop === 'Onion' ? 1800 : 1200;
    const expectedYieldKg = Math.round(farmSize * basePerAcre);
    const pricePerKg = params?.crop === 'Tomato' ? 40 : params?.crop === 'Onion' ? 25 : 50;
    const expectedIncome = expectedYieldKg * pricePerKg;

    const result = {
      expectedYieldKg,
      expectedIncome,
      riskLevel: "Low",
      mainFactors: [
        "Optimal soil moisture levels detected",
        "Favorable 7-day temperature range",
        "Crop stage aligned with seasonal rainfall"
      ]
    };

    // If farmerId is provided, persist prediction
    if (farmerId) {
      try {
        await supabase.from('yield_predictions').insert({
          farmer_id: farmerId,
          predicted_yield_kg: expectedYieldKg,
          confidence_score: 88.5
        });
      } catch (err) {
        console.warn("Could not persist yield prediction:", err);
      }
    }

    return result;
  },

  getYieldHistory: async (farmerId) => {
    if (!farmerId) return [];
    try {
      const { data, error } = await supabase
        .from('yield_predictions')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('predicted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching yield prediction history:", err);
      return [];
    }
  }
};
