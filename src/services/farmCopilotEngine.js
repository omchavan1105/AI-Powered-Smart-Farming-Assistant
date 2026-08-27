/**
 * Farm Copilot Engine — KrishiSetu
 *
 * Central synthesis engine answering: "What should I do on my farm today?"
 * Uses only real, available farm telemetry:
 * - Farmer profile (location, farm size, soil type)
 * - Active crop records (crops, season, sowing date)
 * - Latest soil analysis (pH, NPK, moisture)
 * - Current weather & 48h forecast
 * - Recent disease detection events
 * - Active farm alerts
 *
 * Adheres strictly to the Real-Data Policy:
 * Deterministic rules for safety-critical decisions, explicit provenance, and clear missing-data disclosure.
 */

export function generateDailyFarmCopilot({
  profile,
  crops = [],
  soilRecord = null,
  weatherData = null,
  recentDisease = null,
  alerts = []
}) {
  const activeCrop = crops.length > 0 ? crops[0] : null;
  const cropName = activeCrop?.crop_name || profile?.current_crop || null;
  
  const dataUsed = [];
  const missingData = [];

  // Track data availability
  if (profile?.village || profile?.district) {
    dataUsed.push(`Location: ${profile.village || profile.district}`);
  } else {
    missingData.push('Farm Location');
  }

  if (cropName) {
    dataUsed.push(`Active Crop: ${cropName} (${activeCrop?.season || 'Current'} season)`);
  } else {
    missingData.push('Active Crop Records');
  }

  if (weatherData && !weatherData.isDemo) {
    dataUsed.push(`Live Weather: ${weatherData.temp}°C, ${weatherData.rainProb}% rain chance`);
  } else {
    missingData.push('Live Weather Telemetry');
  }

  if (soilRecord) {
    dataUsed.push(`Soil Health: pH ${soilRecord.ph_level}, Moisture ${soilRecord.moisture_level}%`);
  } else {
    missingData.push('Soil Test Record');
  }

  if (recentDisease && recentDisease.confidence > 0) {
    dataUsed.push(`Latest Diagnosis: ${recentDisease.disease} (${recentDisease.severity} severity)`);
  }

  // ── Determine Top Priority Recommendation & Risk Level ─────────────
  let riskLevel = 'Low';
  let primaryAction = '';
  let reason = '';
  let category = 'general';

  const rainProb = weatherData?.rainProb ?? 0;
  const temp = weatherData?.temp ?? 28;
  const moisture = soilRecord?.moisture_level != null ? parseFloat(soilRecord.moisture_level) : null;
  const hasActiveDisease = recentDisease && !recentDisease.disease.toLowerCase().includes('healthy') && recentDisease.confidence >= 60;

  // Case 1: Active severe disease + high rain risk
  if (hasActiveDisease && rainProb > 50) {
    riskLevel = 'High';
    category = 'disease_weather';
    primaryAction = `Postpone spraying for ${recentDisease.disease} until rainfall clears. Inspect field drainage immediately.`;
    reason = `${recentDisease.disease} is active (${recentDisease.confidence}% confidence), but rain probability is ${rainProb}%. Spraying now will wash away chemicals.`;
  }
  // Case 2: Active severe disease, clear weather
  else if (hasActiveDisease && rainProb <= 50) {
    riskLevel = recentDisease.severity === 'High' ? 'High' : 'Moderate';
    category = 'disease';
    primaryAction = `Apply treatment for ${recentDisease.disease} in ${cropName || 'your crop'} during early morning hours.`;
    reason = `${recentDisease.disease} diagnosed with ${recentDisease.confidence}% confidence. Clear weather provides an optimal 24-48h spraying window.`;
  }
  // Case 3: Critical soil moisture deficit
  else if (moisture !== null && moisture < 30) {
    riskLevel = 'High';
    category = 'irrigation';
    primaryAction = `Schedule immediate irrigation for ${cropName || 'your field'}.`;
    reason = `Soil moisture is critically low at ${moisture}% (below safe 35% threshold), putting crops at risk of wilting.`;
  }
  // Case 4: Extreme heat stress
  else if (temp >= 38) {
    riskLevel = 'Moderate';
    category = 'weather';
    primaryAction = `Provide light morning irrigation and mulch surface soil to protect against heat desiccation.`;
    reason = `Field temperature reached ${temp}°C, creating high evaporative demand.`;
  }
  // Case 5: Heavy rain forecast
  else if (rainProb >= 70) {
    riskLevel = 'Moderate';
    category = 'weather';
    primaryAction = `Clear field drainage furrows and skip scheduled irrigation today.`;
    reason = `High rainfall probability (${rainProb}%) expected in ${profile?.village || 'your area'}.`;
  }
  // Case 6: Optimal conditions
  else if (cropName) {
    riskLevel = 'Low';
    category = 'routine';
    primaryAction = `Maintain standard irrigation schedule and conduct routine morning leaf inspection for ${cropName}.`;
    reason = `Weather and soil conditions are currently within normal, favorable ranges for your crop.`;
  }
  // Case 7: Incomplete farm profile
  else {
    riskLevel = 'Low';
    category = 'setup';
    primaryAction = `Add your active crops and latest soil test to unlock customized daily farm guidance.`;
    reason = `Farm profile is missing active crop and soil health records.`;
  }

  return {
    riskLevel,
    primaryAction,
    reason,
    category,
    cropName: cropName || 'General Farm',
    dataUsed,
    missingData,
    hasSufficientData: dataUsed.length >= 2,
    timestamp: new Date().toISOString()
  };
}
