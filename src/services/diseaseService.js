import { supabase } from '../lib/supabase';
import { alertService } from './alertService';

const AI_API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export const diseaseService = {
  /**
   * Analyzes crop leaf image using the real Python FastAPI AI/ML microservice.
   * Gracefully falls back to localized demo inference if microservice is offline.
   */
  detectDisease: async (imageFile, farmerId = null, language = 'en', cropName = 'Crop') => {
    let prediction = null;

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${AI_API_BASE_URL}/predict/disease?language=${encodeURIComponent(language)}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        prediction = {
          disease: data.disease,
          confidence: data.confidence,
          crop: data.crop,
          severity: data.severity,
          symptoms: data.symptoms || [],
          recommendedAction: data.recommended_action || '',
          prevention: data.prevention || '',
          isUncertain: data.is_uncertain || false,
          isRealAI: true
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned ${response.status}`);
      }
    } catch (err) {
      console.warn("AI Microservice offline or unreachable:", err.message);
      
      // Honest error — do NOT return a fake diagnosis
      prediction = {
        disease: "AI Service Unavailable",
        confidence: 0,
        crop: cropName || "Unknown",
        severity: "Unknown",
        symptoms: ["The AI disease detection service is currently offline or unreachable."],
        recommendedAction: "Please ensure the AI microservice is running at " + AI_API_BASE_URL + " and try again. If the issue persists, consult your local agricultural officer for in-person leaf diagnosis.",
        prevention: "Start the AI service with: cd ai-service && uvicorn main:app --host 0.0.0.0 --port 8000",
        isUncertain: true,
        isRealAI: false
      };
    }

    // Persist detection record and auto-trigger Alert to Supabase
    if (farmerId && prediction && !prediction.isUncertain) {
      try {
        await supabase.from('disease_detections').insert({
          farmer_id: farmerId,
          detected_disease: prediction.disease,
          confidence_score: prediction.confidence,
          severity: prediction.severity,
          recommended_action: prediction.recommendedAction
        });

        // If active disease identified (not healthy), auto-generate high/medium priority alert
        if (prediction.disease !== 'Healthy Plant') {
          await alertService.createAlert({
            farmerId,
            alertType: 'pest',
            priority: prediction.severity === 'High' ? 'High' : 'Medium',
            message: `Disease Diagnosed: ${prediction.disease} in ${prediction.crop || cropName}. Confidence: ${prediction.confidence}%. Action: ${prediction.recommendedAction}`
          }).catch(alertErr => console.warn("Could not auto-insert alert:", alertErr));
        }
      } catch (dbErr) {
        console.warn("Could not persist disease detection record to Supabase:", dbErr);
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
  },

  // Check health of Python FastAPI microservice
  checkHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${AI_API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, ...data };
      }
      return { isOnline: false };
    } catch (e) {
      return { isOnline: false };
    }
  }
};
