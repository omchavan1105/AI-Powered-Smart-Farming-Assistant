/**
 * Soil Health & Fertilizer Recommendation Engine — KrishiSetu
 * 
 * Based on Indian Council of Agricultural Research (ICAR) soil test interpretation standards.
 * Computes deterministic, explainable soil health scores, nutrient deficiency detection,
 * general fertilizer advisories, and moisture/irrigation recommendations.
 */

// ─── ICAR Standard Benchmarks (mg/kg or ppm) ─────────────────────────
const SOIL_BENCHMARKS = {
  nitrogen: { low: 140, high: 280, optimal: 210, label: 'Nitrogen (N)' },
  phosphorus: { low: 10, high: 25, optimal: 18, label: 'Phosphorus (P)' },
  potassium: { low: 110, high: 280, optimal: 195, label: 'Potassium (K)' },
  ph: { minAcidic: 5.5, optimalMin: 6.2, optimalMax: 7.5, maxAlkaline: 8.5 },
  moisture: { dry: 30, optimalMin: 45, optimalMax: 70, waterlogged: 85 }
};

/**
 * Calculates deterministic Soil Health Score (0 - 100)
 */
export function calculateSoilHealthScore(ph, nitrogen, phosphorus, potassium, moisture) {
  let score = 100;
  const penalties = [];

  // 1. pH evaluation (max penalty -25)
  if (ph < 5.5) {
    const penalty = Math.min(25, Math.round((5.5 - ph) * 12));
    score -= penalty;
    penalties.push(`Acidic soil (pH ${ph})`);
  } else if (ph > 8.0) {
    const penalty = Math.min(25, Math.round((ph - 8.0) * 12));
    score -= penalty;
    penalties.push(`Alkaline soil (pH ${ph})`);
  }

  // 2. Nitrogen evaluation (max penalty -25)
  if (nitrogen < SOIL_BENCHMARKS.nitrogen.low) {
    const penalty = Math.min(25, Math.round(((SOIL_BENCHMARKS.nitrogen.low - nitrogen) / SOIL_BENCHMARKS.nitrogen.low) * 25));
    score -= penalty;
    penalties.push('Low available Nitrogen');
  } else if (nitrogen > 350) {
    score -= 10;
    penalties.push('Excess Nitrogen');
  }

  // 3. Phosphorus evaluation (max penalty -20)
  if (phosphorus < SOIL_BENCHMARKS.phosphorus.low) {
    const penalty = Math.min(20, Math.round(((SOIL_BENCHMARKS.phosphorus.low - phosphorus) / SOIL_BENCHMARKS.phosphorus.low) * 20));
    score -= penalty;
    penalties.push('Low available Phosphorus');
  }

  // 4. Potassium evaluation (max penalty -20)
  if (potassium < SOIL_BENCHMARKS.potassium.low) {
    const penalty = Math.min(20, Math.round(((SOIL_BENCHMARKS.potassium.low - potassium) / SOIL_BENCHMARKS.potassium.low) * 20));
    score -= penalty;
    penalties.push('Low available Potassium');
  }

  // 5. Moisture evaluation (max penalty -15)
  if (moisture < SOIL_BENCHMARKS.moisture.dry) {
    score -= 15;
    penalties.push('Critical moisture deficit');
  } else if (moisture > SOIL_BENCHMARKS.moisture.waterlogged) {
    score -= 15;
    penalties.push('Excess water saturation');
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));
  
  let rating = 'Excellent';
  if (finalScore < 50) rating = 'Poor';
  else if (finalScore < 70) rating = 'Moderate';
  else if (finalScore < 85) rating = 'Good';

  return {
    score: finalScore,
    rating,
    penalties
  };
}

/**
 * Analyzes soil records and generates comprehensive agronomic recommendations
 */
export function generateSoilRecommendation(recordData, cropName = 'General Crops') {
  const ph = parseFloat(recordData?.ph || recordData?.ph_level || 7.0);
  const nitrogen = parseFloat(recordData?.nitrogen || 200);
  const phosphorus = parseFloat(recordData?.phosphorus || 18);
  const potassium = parseFloat(recordData?.potassium || 190);
  const moisture = parseFloat(recordData?.moisture || recordData?.moisture_level || 50);

  const health = calculateSoilHealthScore(ph, nitrogen, phosphorus, potassium, moisture);
  const deficiencies = [];
  const fertilizerGuidance = [];
  const irrigationAdvice = [];

  // pH interpretation & amendment
  let phStatus = 'Neutral (Optimal)';
  if (ph < 6.0) {
    phStatus = 'Acidic';
    deficiencies.push('Soil is acidic, which restricts phosphorus and micronutrient availability.');
    fertilizerGuidance.push('Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH gradually towards 6.5.');
  } else if (ph > 7.8) {
    phStatus = 'Alkaline / Calcareous';
    deficiencies.push('Soil is alkaline, which may cause iron, zinc, and manganese lock-up.');
    fertilizerGuidance.push('Incorporate well-decomposed organic farmyard manure (FYM) or gypsum to improve soil structure and balance alkalinity.');
  }

  // Nitrogen guidance
  if (nitrogen < SOIL_BENCHMARKS.nitrogen.low) {
    deficiencies.push(`Nitrogen is deficient (${nitrogen} mg/kg vs benchmark ≥140 mg/kg).`);
    fertilizerGuidance.push('Split application of Nitrogen: Apply well-rotted compost/vermicompost as basal dose, followed by Neem-coated Urea or organic nitrogen top-dressing at vegetative growth.');
  } else if (nitrogen > 320) {
    fertilizerGuidance.push('Nitrogen levels are very high. Reduce urea applications to prevent excessive foliage and susceptibility to sucking pests.');
  } else {
    fertilizerGuidance.push('Nitrogen is within the optimal range. Maintain balanced standard maintenance doses.');
  }

  // Phosphorus guidance
  if (phosphorus < SOIL_BENCHMARKS.phosphorus.low) {
    deficiencies.push(`Phosphorus is low (${phosphorus} mg/kg vs benchmark ≥10 mg/kg).`);
    fertilizerGuidance.push('Apply Single Super Phosphate (SSP) or DAP placed near the root zone during sowing/planting to promote strong root development.');
  } else {
    fertilizerGuidance.push('Phosphorus status is sufficient. Regular organic matter addition will sustain microbial solubilization.');
  }

  // Potassium guidance
  if (potassium < SOIL_BENCHMARKS.potassium.low) {
    deficiencies.push(`Potassium is low (${potassium} mg/kg vs benchmark ≥110 mg/kg).`);
    fertilizerGuidance.push('Apply Muriate of Potash (MOP) or organic wood ash to enhance pest resistance, drought tolerance, and fruit/grain quality.');
  } else {
    fertilizerGuidance.push('Potassium availability is good. Support with standard crop-specific basal feed.');
  }

  // Moisture & Irrigation guidance
  if (moisture < 35) {
    irrigationAdvice.push('Soil moisture is low. Schedule irrigation within the next 24-48 hours, preferring drip or furrow irrigation to conserve moisture.');
  } else if (moisture > 75) {
    irrigationAdvice.push('Soil moisture is saturated. Halt irrigation and check field drainage to prevent root rot or fungal infection.');
  } else {
    irrigationAdvice.push('Moisture levels are optimal for nutrient uptake and root respiration. Maintain normal irrigation cycle.');
  }

  return {
    cropName,
    healthScore: health.score,
    rating: health.rating,
    phStatus,
    deficiencies: deficiencies.length > 0 ? deficiencies : ['No severe nutrient deficiencies detected.'],
    fertilizerGuidance,
    irrigationAdvice,
    summary: `Soil Health rated ${health.rating} (${health.score}/100) with pH ${ph.toFixed(1)} and ${moisture.toFixed(0)}% moisture.`
  };
}
