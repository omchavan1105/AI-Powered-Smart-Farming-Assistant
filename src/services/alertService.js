import { supabase } from '../lib/supabase';

export const alertService = {
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
      console.error("Error fetching farmer alerts:", err);
      return [];
    }
  },

  createAlert: async (alertData) => {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        farmer_id: alertData.farmerId,
        alert_type: alertData.alertType || 'general',
        priority: alertData.priority || 'Medium',
        message: alertData.message,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  markAlertRead: async (alertId) => {
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
