// Mock Yield Service
export const yieldService = {
  predictYield: async (params) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      expectedYieldKg: 4500,
      expectedIncome: 180000, // in local currency
      riskLevel: "Low",
      mainFactors: ["Optimal Soil Moisture", "Favorable upcoming weather", "Pest risk managed"]
    };
  }
};
