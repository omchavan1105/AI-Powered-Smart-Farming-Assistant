/**
 * 7-Day Farm Action Plan Engine — KrishiSetu
 *
 * Generates an actionable, dynamic 7-day schedule for the farmer.
 * Factors:
 * - Active crop & season
 * - 7-day weather forecast (rain probabilities, temperatures)
 * - Current soil moisture & pH status
 * - Active disease or pest alerts
 */

export function generate7DayActionPlan({
  cropName = 'Tomato',
  weatherForecast = [],
  soilRecord = null,
  recentDisease = null
}) {
  const plan = [];
  const today = new Date();

  // If no weather forecast provided, create default day structure
  const forecastDays = Array.isArray(weatherForecast) && weatherForecast.length > 0
    ? weatherForecast
    : Array.from({ length: 7 }, (_, i) => ({
        day: new Date(today.getTime() + i * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: 28,
        rainProb: 20,
        condition: 'Clear',
        isDemo: true
      }));

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today.getTime() + i * 86400000);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const weather = forecastDays[i] || { temp: 28, rainProb: 10, condition: 'Clear' };
    const rainProb = weather.rainProb ?? 0;
    const temp = weather.temp ?? 28;

    let activity = '';
    let category = 'irrigation';
    let reason = '';
    let priority = 'Normal';

    if (i === 0) {
      // Day 1 (Today)
      if (recentDisease && !recentDisease.disease.toLowerCase().includes('healthy') && recentDisease.confidence >= 60) {
        if (rainProb > 50) {
          activity = `Inspect crop for ${recentDisease.disease} spread; hold spraying due to rain forecast.`;
          category = 'disease';
          priority = 'High';
          reason = `Active disease identified but ${rainProb}% rain chance will wash away foliar sprays.`;
        } else {
          activity = `Apply recommended protective spray for ${recentDisease.disease}.`;
          category = 'disease';
          priority = 'High';
          reason = `Dry window (${temp}°C, ${rainProb}% rain) is optimal for foliar spray absorption.`;
        }
      } else if (soilRecord && parseFloat(soilRecord.moisture_level) < 35) {
        activity = `Morning irrigation for ${cropName} field.`;
        category = 'irrigation';
        priority = 'High';
        reason = `Soil moisture is below optimal range (${soilRecord.moisture_level}%).`;
      } else {
        activity = `Scout field corners for early sucking pests and monitor leaf color.`;
        category = 'scouting';
        reason = `Favorable weather conditions (${temp}°C, ${weather.condition || 'Clear'}).`;
      }
    } else if (rainProb >= 60) {
      activity = `Check field drainage channels to prevent waterlogging; postpone pesticide sprays.`;
      category = 'weather';
      priority = 'High';
      reason = `${rainProb}% rain probability forecast for ${dayName}.`;
    } else if (temp >= 38) {
      activity = `Provide light evening irrigation to mitigate high thermal stress.`;
      category = 'irrigation';
      priority = 'Medium';
      reason = `High temperature (${temp}°C) expected.`;
    } else if (i === 2 || i === 5) {
      activity = `Monitor soil moisture and check fertilizer absorption around root zone.`;
      category = 'nutrient';
      reason = `Mid-week crop nutrition and moisture check.`;
    } else if (i === 3) {
      activity = `Weed removal and inspect lower canopy foliage for fungal spots.`;
      category = 'scouting';
      reason = `Regular preventive agronomic sanitation.`;
    } else {
      activity = `Routine morning field inspection and irrigation valve check.`;
      category = 'routine';
      reason = `Stable agro-climatic conditions forecast.`;
    }

    plan.push({
      dayIndex: i,
      dayName,
      dateFormatted: formattedDate,
      activity,
      category,
      priority,
      reason,
      weather: {
        temp,
        rainProb,
        condition: weather.condition || 'Clear',
        isDemo: weather.isDemo || false
      },
      dataSource: weather.isDemo ? 'Forecast (Sample / Baseline)' : 'Live Weather Forecast'
    });
  }

  return plan;
}
