import { supabase } from '../lib/supabase';

export const diseaseService = {
  // Analyzes image (Member 3 will attach real AI model; currently provides demo ML prediction)
  detectDisease: async (imageFile, farmerId = null) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating ML inference
    
    const prediction = {
      disease: "Early Blight",
      confidence: 94.5,
      severity: "Moderate",
      symptoms: ["Brown spots with concentric rings on lower leaves", "Yellowing of surrounding tissue"],
      recommendedAction: "Apply Mancozeb or Copper Oxychloride spray every 7-10 days.",
      prevention: "Ensure proper plant spacing for air circulation and avoid overhead sprinkler watering."
    };

    // If a logged-in farmer is provided, persist the detection record to Supabase
    if (farmerId) {
      try {
        await supabase.from('disease_detections').insert({
          farmer_id: farmerId,
          detected_disease: prediction.disease,
          confidence_score: prediction.confidence,
          severity: prediction.severity,
          recommended_action: prediction.recommendedAction
        });
      } catch (err) {
        console.warn("Could not persist disease detection record:", err);
      }
    }

    return prediction;
  },

  // Query detection history for a farmer
  getDiseaseHistory: async (farmerId) => {
    if (!farmerId) return [];
    try {
      const { data, error } = await supabase
        .from('disease_detections')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching disease detection history:", err);
      return [];
    }
  }
};
