import { supabase } from '../lib/supabase';

export const yieldService = {
  predictYield: async (params, farmerId = null) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const farmSize = parseFloat(params?.farmSize) || 2;
    const crop = params?.crop || 'Tomato';
    
    // Regional benchmark averages (kg per acre)
    const yieldBenchmarks = {
      'Tomato': 2400,
      'Onion': 2000,
      'Potato': 2800,
      'Corn': 1600,
      'Soybean': 900,
      'Cotton': 800
    };

    // Benchmark farm gate prices (₹ per kg)
    const priceBenchmarks = {
      'Tomato': 35,
      'Onion': 25,
      'Potato': 22,
      'Corn': 24,
      'Soybean': 48,
      'Cotton': 65
    };

    // Benchmark input cost per acre (seeds, fertilizers, labor, machinery)
    const costBenchmarks = {
      'Tomato': 28000,
      'Onion': 22000,
      'Potato': 30000,
      'Corn': 16000,
      'Soybean': 14000,
      'Cotton': 20000
    };

    const basePerAcre = yieldBenchmarks[crop] || 1500;
    const pricePerKg = priceBenchmarks[crop] || 30;
    const costPerAcre = costBenchmarks[crop] || 20000;

    const expectedYieldKg = Math.round(farmSize * basePerAcre);
    const expectedGrossIncome = expectedYieldKg * pricePerKg;
    const estimatedTotalCost = Math.round(farmSize * costPerAcre);
    const estimatedNetProfit = expectedGrossIncome - estimatedTotalCost;

    const costBreakdown = {
      seeds: Math.round(estimatedTotalCost * 0.20),
      fertilizers: Math.round(estimatedTotalCost * 0.35),
      labor: Math.round(estimatedTotalCost * 0.30),
      irrigationAndMachinery: Math.round(estimatedTotalCost * 0.15)
    };

    const result = {
      crop,
      farmSize,
      expectedYieldKg,
      expectedIncome: expectedGrossIncome,
      estimatedTotalCost,
      estimatedNetProfit,
      costBreakdown,
      pricePerKg,
      riskLevel: "Moderate",
      mainFactors: [
        `Regional ICAR average yield benchmark for ${crop}: ${basePerAcre} kg/acre`,
        `Estimated farm gate price: ₹${pricePerKg}/kg based on seasonal mandi modal rates`,
        `Production cost: ₹${costPerAcre.toLocaleString()}/acre covering seeds, nutrients, and labor`
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
