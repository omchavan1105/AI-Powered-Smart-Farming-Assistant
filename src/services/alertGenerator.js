/**
 * Intelligent Alert Generator — KrishiSetu
 * 
 * Generates verified, actionable, data-driven alerts from weather forecasts,
 * disease diagnoses, market fluctuations, and soil health conditions.
 * No random or unexplainable alerts.
 */

export const alertGenerator = {
  /**
   * Generates weather-induced agricultural alerts
   */
  fromWeather: (weatherData) => {
    if (!weatherData || weatherData.isDemo) return [];
    const alerts = [];
    const { temp, humidity, windSpeed, rainProb, rainfall, location } = weatherData;

    if (rainProb >= 70 || (rainfall && rainfall >= 10)) {
      alerts.push({
        id: `weather-rain-${Date.now()}`,
        alert_type: 'weather',
        priority: rainProb >= 85 ? 'High' : 'Medium',
        title: 'Heavy Rainfall Advisory',
        message: `${rainProb}% probability of rain recorded in ${location || 'your area'}. Ensure field drainage channels are cleared to prevent waterlogging. Postpone foliar spraying.`,
        reason: `Rainfall probability (${rainProb}%) exceeded the 70% advisory threshold.`,
        created_at: new Date().toISOString()
      });
    }

    if (temp >= 38) {
      alerts.push({
        id: `weather-heat-${Date.now()}`,
        alert_type: 'weather',
        priority: 'High',
        title: 'High Thermal Stress Alert',
        message: `Field temperature reached ${temp}°C. Schedule light irrigations during early morning hours to protect vegetative and flowering stages from heat desiccation.`,
        reason: `Ambient temperature (${temp}°C) exceeds the 38°C thermal stress threshold.`,
        created_at: new Date().toISOString()
      });
    } else if (temp <= 6) {
      alerts.push({
        id: `weather-cold-${Date.now()}`,
        alert_type: 'weather',
        priority: 'High',
        title: 'Frost / Cold Wave Warning',
        message: `Temperatures dropped to ${temp}°C. Sensitive crops risk frost injury. Apply surface mulching or protective covers overnight.`,
        reason: `Ambient temperature (${temp}°C) dropped below 6°C frost threshold.`,
        created_at: new Date().toISOString()
      });
    }

    if (windSpeed >= 25) {
      alerts.push({
        id: `weather-wind-${Date.now()}`,
        alert_type: 'weather',
        priority: 'Medium',
        title: 'High Wind Spraying Advisory',
        message: `Wind speed is ${windSpeed} km/h. Halt all pesticide and herbicide spray operations to prevent chemical drift and loss.`,
        reason: `Wind speed (${windSpeed} km/h) exceeds safe spraying threshold (25 km/h).`,
        created_at: new Date().toISOString()
      });
    }

    if (humidity >= 85 && temp >= 24 && temp <= 32) {
      alerts.push({
        id: `weather-fungal-${Date.now()}`,
        alert_type: 'pest',
        priority: 'Medium',
        title: 'High Fungal Infection Risk Window',
        message: `High relative humidity (${humidity}%) combined with warm temperature (${temp}°C) creates ideal microclimate for foliar fungal diseases (blights and downy mildew). Inspect leaves regularly.`,
        reason: `Humidity (${humidity}%) and temperature (${temp}°C) within high fungal vulnerability range.`,
        created_at: new Date().toISOString()
      });
    }

    return alerts;
  },

  /**
   * Generates alerts from disease diagnosis output
   */
  fromDiseaseDetection: (predictionResult, cropName = 'Crop') => {
    if (!predictionResult || predictionResult.isUncertain || predictionResult.disease === 'Healthy Plant') {
      return [];
    }

    return [{
      id: `disease-${Date.now()}`,
      alert_type: 'pest',
      priority: predictionResult.severity === 'High' ? 'High' : 'Medium',
      title: `Disease Diagnosed: ${predictionResult.disease} in ${cropName}`,
      message: `${predictionResult.disease} detected with ${predictionResult.confidence}% confidence. ${predictionResult.recommendedAction || 'Refer to recommended spray schedule.'}`,
      reason: `AI disease classifier flagged ${predictionResult.disease} with ${predictionResult.confidence}% confidence.`,
      created_at: new Date().toISOString()
    }];
  },

  /**
   * Generates alerts from major market price shifts
   */
  fromMarketPrices: (marketItems) => {
    if (!marketItems || marketItems.length === 0) return [];
    const alerts = [];

    marketItems.forEach((item) => {
      if (item.percentChange && Math.abs(item.percentChange) >= 5) {
        const isUp = item.percentChange > 0;
        alerts.push({
          id: `market-${item.id || item.crop}-${Date.now()}`,
          alert_type: 'market',
          priority: Math.abs(item.percentChange) >= 8 ? 'High' : 'Medium',
          title: `Mandi Price ${isUp ? 'Surge' : 'Drop'}: ${item.crop} (${item.market})`,
          message: `${item.crop} modal price shifted by ${isUp ? '+' : ''}${item.percentChange}% to ₹${item.currentPrice}/Q. Current advisory: ${item.recommendation} indicator.`,
          reason: `Price movement of ${item.percentChange}% exceeds the 5% market alert threshold.`,
          created_at: new Date().toISOString()
        });
      }
    });

    return alerts;
  },

  /**
   * Generates alerts from soil health records
   */
  fromSoilRecord: (soilRecord) => {
    if (!soilRecord) return [];
    const alerts = [];
    const moisture = parseFloat(soilRecord.moisture_level || soilRecord.moisture);
    const ph = parseFloat(soilRecord.ph_level || soilRecord.ph);

    if (moisture < 30) {
      alerts.push({
        id: `soil-moisture-low-${Date.now()}`,
        alert_type: 'soil',
        priority: 'High',
        title: 'Critical Soil Moisture Deficit',
        message: `Soil moisture dropped to ${moisture}%. Crops are at immediate risk of moisture stress and wilt. Irrigate promptly.`,
        reason: `Soil moisture (${moisture}%) dropped below 30% critical threshold.`,
        created_at: new Date().toISOString()
      });
    }

    if (ph < 5.5) {
      alerts.push({
        id: `soil-ph-acidic-${Date.now()}`,
        alert_type: 'soil',
        priority: 'Medium',
        title: 'Soil Acidity Warning',
        message: `Soil pH is ${ph} (Acidic). Consider applying agricultural lime before next sowing to restore nutrient availability.`,
        reason: `Soil pH (${ph}) below 5.5 threshold.`,
        created_at: new Date().toISOString()
      });
    }

    return alerts;
  }
};
