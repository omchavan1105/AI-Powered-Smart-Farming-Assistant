import { supabase } from '../lib/supabase';

export const marketService = {
  getMarketPrices: async (cropName) => {
    try {
      let query = supabase.from('market_prices').select('*').order('recorded_date', { ascending: false });
      
      if (cropName) {
        query = query.eq('crop_name', cropName);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If DB has data, return it
      if (data && data.length > 0) {
        // Transform Supabase structure to match frontend expectations
        return data.map(item => {
          // Fake trend calculation for UI purposes since we don't have historical arrays yet
          const trend = Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'stable');
          return {
            id: item.id,
            crop: item.crop_name,
            market: item.market_name,
            currentPrice: item.modal_price || item.max_price,
            previousPrice: item.min_price || (item.modal_price - 50),
            trend: trend
          };
        });
      }
      
      // Fallback if DB is empty
      return [
        { id: 1, crop: "Tomato", market: "Pune APMC", currentPrice: 4500, previousPrice: 4000, trend: "up" },
        { id: 2, crop: "Onion", market: "Lasalgaon", currentPrice: 2200, previousPrice: 2500, trend: "down" },
        { id: 3, crop: "Soybean", market: "Latur", currentPrice: 4200, previousPrice: 4150, trend: "up" },
        { id: 4, crop: "Cotton", market: "Amravati", currentPrice: 7100, previousPrice: 7100, trend: "stable" }
      ];
    } catch (err) {
      console.error("Error fetching market prices:", err);
      return []; // In real scenario, might return error state
    }
  }
};
