// Mock Disease Service
// Returns DEMO ML predictions.

export const diseaseService = {
  detectDisease: async (imageFile) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating ML processing
    
    return {
      disease: "Early Blight",
      confidence: 92.5,
      severity: "Moderate",
      symptoms: ["Brown spots with concentric rings on lower leaves", "Yellowing of leaves"],
      recommendedAction: "Apply Mancozeb or Copper-based fungicides.",
      prevention: "Ensure proper spacing for air circulation. Avoid overhead watering."
    };
  }
};
