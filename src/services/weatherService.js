import { supabase } from '../lib/supabase';

export const weatherService = {
  getCurrentWeather: async (location) => {
    if (!location) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('weather_api', {
        body: { location, action: 'current' }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Weather Service Error (Current):", err);
      // Return fallback demo data if the API fails or is not connected
      return {
        temp: 28,
        feelsLike: 30,
        humidity: 65,
        rainProb: 40,
        rainfall: 0,
        windSpeed: 12,
        condition: "Partly Cloudy",
        location: location || "Your Farm"
      };
    }
  },

  getForecast: async (location) => {
    if (!location) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke('weather_api', {
        body: { location, action: 'forecast' }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Weather Service Error (Forecast):", err);
      // Return fallback demo data if the API fails or is not connected
      return [
        { day: "Mon", temp: 29, condition: "Sunny", rainProb: 10 },
        { day: "Tue", temp: 27, condition: "Cloudy", rainProb: 60 },
        { day: "Wed", temp: 25, condition: "Rain", rainProb: 90 },
        { day: "Thu", temp: 26, condition: "Rain", rainProb: 80 },
        { day: "Fri", temp: 28, condition: "Partly Cloudy", rainProb: 30 },
        { day: "Sat", temp: 30, condition: "Sunny", rainProb: 10 },
        { day: "Sun", temp: 31, condition: "Sunny", rainProb: 0 },
      ];
    }
  }
};
