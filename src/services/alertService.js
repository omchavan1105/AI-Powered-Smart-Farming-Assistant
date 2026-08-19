import { supabase } from '../lib/supabase';
import { alertGenerator } from './alertGenerator';

export const alertService = {
  /**
   * Fetch all alerts for a farmer from Supabase database
   */
  getFarmerAlerts: async (farmerId) => {
    if (!farmerId) return [];
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching farmer alerts from DB:", err);
      return [];
    }
  },

  /**
   * Insert a new alert for a farmer
   */
  createAlert: async (alertData) => {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        farmer_id: alertData.farmerId,
        alert_type: alertData.alertType || alertData.alert_type || 'general',
        priority: alertData.priority || 'Medium',
        message: alertData.message,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark an alert as read
   */
  markAlertRead: async (alertId) => {
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Generates dynamic actionable alerts from active weather, market, soil, and disease conditions
   */
  generateLiveAlerts: ({ weatherData, marketData, soilData, diseaseData, cropName }) => {
    const weatherAlerts = alertGenerator.fromWeather(weatherData);
    const diseaseAlerts = alertGenerator.fromDiseaseDetection(diseaseData, cropName);
    const marketAlerts = alertGenerator.fromMarketPrices(marketData);
    const soilAlerts = alertGenerator.fromSoilRecord(soilData);

    return [...diseaseAlerts, ...weatherAlerts, ...marketAlerts, ...soilAlerts];
  }
};
