import { supabase } from '../lib/supabase';

const FALLBACK_PRICES = [
  { id: 1, crop: "Tomato", market: "Pune APMC", currentPrice: 4500, previousPrice: 4000, trend: "up" },
  { id: 2, crop: "Onion", market: "Lasalgaon", currentPrice: 2200, previousPrice: 2500, trend: "down" },
  { id: 3, crop: "Soybean", market: "Latur", currentPrice: 4200, previousPrice: 4150, trend: "up" },
  { id: 4, crop: "Cotton", market: "Amravati", currentPrice: 7100, previousPrice: 7100, trend: "stable" },
  { id: 5, crop: "Wheat", market: "Khanna APMC", currentPrice: 2300, previousPrice: 2275, trend: "up" },
  { id: 6, crop: "Gram (Chana)", market: "Indore APMC", currentPrice: 6000, previousPrice: 5900, trend: "up" },
  { id: 7, crop: "Rice (Paddy)", market: "Karnal APMC", currentPrice: 2250, previousPrice: 2250, trend: "stable" }
];

export const marketService = {
  getMarketPrices: async (cropName) => {
    try {
      let query = supabase.from('market_prices').select('*').order('recorded_date', { ascending: false });
      
      if (cropName) {
        query = query.ilike('crop_name', `%${cropName}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If DB has data, return it
      if (data && data.length > 0) {
        return data.map(item => {
          const currentPrice = item.modal_price || item.max_price || 0;
          const previousPrice = item.min_price || (currentPrice > 50 ? currentPrice - 50 : currentPrice);
          const diff = currentPrice - previousPrice;
          const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

          return {
            id: item.id,
            crop: item.crop_name,
            market: item.market_name,
            currentPrice,
            previousPrice,
            trend
          };
        });
      }
      
      // Fallback if DB is empty or filtered
      if (cropName) {
        const filtered = FALLBACK_PRICES.filter(p => p.crop.toLowerCase().includes(cropName.toLowerCase()));
        return filtered.length > 0 ? filtered : FALLBACK_PRICES;
      }

      return FALLBACK_PRICES;
    } catch (err) {
      console.warn("Error fetching market prices from DB, using reference fallback:", err);
      return FALLBACK_PRICES;
    }
  }
};
