import { supabase } from '../lib/supabase';

/**
 * Weather Service — KrishiSetu
 * Calls the Supabase Edge Function 'weather_api' which proxies WeatherAPI.com
 * Falls back to clearly-labeled demo data when the Edge Function is unavailable.
 * 
 * IMPORTANT: The Edge Function requires WEATHER_API_KEY set as a Supabase secret.
 * Without it, fallback demo data will be returned with isDemo: true.
 */

// ─── Error Categories ───────────────────────────────────────────────
const WEATHER_ERRORS = {
  MISSING_LOCATION: 'Please provide a valid location (city, district, or village name).',
  API_UNAVAILABLE: 'Weather service is temporarily unavailable. Showing recent cached data.',
  INVALID_LOCATION: 'Could not find weather data for this location. Please check the spelling.',
  RATE_LIMITED: 'Too many weather requests. Please try again in a few minutes.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT: 'Weather request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred while fetching weather data.'
};

// ─── Fallback Demo Data (clearly labeled) ────────────────────────────
const DEMO_CURRENT_WEATHER = {
  temp: 28,
  feelsLike: 30,
  humidity: 65,
  rainProb: 40,
  rainfall: 0,
  windSpeed: 12,
  condition: "Partly Cloudy",
  location: "Demo Location",
  isDemo: true,
  demoReason: "Weather API is not connected. This is sample data for preview purposes only."
};

const DEMO_FORECAST = [
  { day: "Mon", temp: 29, condition: "Sunny", rainProb: 10, isDemo: true },
  { day: "Tue", temp: 27, condition: "Cloudy", rainProb: 60, isDemo: true },
  { day: "Wed", temp: 25, condition: "Rain", rainProb: 90, isDemo: true },
  { day: "Thu", temp: 26, condition: "Rain", rainProb: 80, isDemo: true },
  { day: "Fri", temp: 28, condition: "Partly Cloudy", rainProb: 30, isDemo: true },
  { day: "Sat", temp: 30, condition: "Sunny", rainProb: 10, isDemo: true },
  { day: "Sun", temp: 31, condition: "Sunny", rainProb: 0, isDemo: true },
];

// ─── Error Classification ────────────────────────────────────────────
function classifyWeatherError(err) {
  const msg = (err?.message || err?.toString() || '').toLowerCase();

  if (msg.includes('no matching location') || msg.includes('location not found') || msg.includes('invalid location')) {
    return { code: 'INVALID_LOCATION', message: WEATHER_ERRORS.INVALID_LOCATION };
  }
  if (msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('quota')) {
    return { code: 'RATE_LIMITED', message: WEATHER_ERRORS.RATE_LIMITED };
  }
  if (msg.includes('timeout') || msg.includes('abort') || msg.includes('timed out')) {
    return { code: 'TIMEOUT', message: WEATHER_ERRORS.TIMEOUT };
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('dns')) {
    return { code: 'NETWORK_ERROR', message: WEATHER_ERRORS.NETWORK_ERROR };
  }
  if (msg.includes('weather_api_key') || msg.includes('not set') || msg.includes('secret')) {
    return { code: 'API_UNAVAILABLE', message: WEATHER_ERRORS.API_UNAVAILABLE };
  }
  return { code: 'UNKNOWN', message: WEATHER_ERRORS.UNKNOWN };
}

// ─── Farming Impact Generator ────────────────────────────────────────
/**
 * Generates farming-relevant advisory text from real weather data.
 * Returns null fields if data is demo.
 */
export function generateFarmingImpact(weatherData) {
  if (!weatherData || weatherData.isDemo) {
    return {
      sprayingAdvisory: null,
      irrigationAdvisory: null,
      generalAdvisory: null
    };
  }

  const { temp, humidity, windSpeed, rainProb, rainfall, condition } = weatherData;
  let sprayingAdvisory = '';
  let irrigationAdvisory = '';
  let generalAdvisory = '';

  // Spraying Advisory
  if (windSpeed > 20) {
    sprayingAdvisory = `Wind speed is high (${windSpeed} km/h). Avoid pesticide/fungicide spraying today — drift risk is significant.`;
  } else if (rainProb > 60 || (rainfall && rainfall > 5)) {
    sprayingAdvisory = `Rain probability is ${rainProb}%. Postpone spraying — chemicals will be washed away. Spray when a dry window of 4+ hours is expected.`;
  } else if (humidity > 85) {
    sprayingAdvisory = `High humidity (${humidity}%). Spraying is possible but monitor for fungal conditions. Early morning application recommended.`;
  } else {
    sprayingAdvisory = `Conditions are favorable for spraying. Wind: ${windSpeed} km/h, Humidity: ${humidity}%. Best time: early morning or late evening.`;
  }

  // Irrigation Advisory
  if (rainProb > 70 || (rainfall && rainfall > 10)) {
    irrigationAdvisory = `Significant rainfall expected (${rainProb}% probability). Skip irrigation today to avoid waterlogging.`;
  } else if (temp > 38) {
    irrigationAdvisory = `High temperature (${temp}°C). Increase irrigation frequency. Water crops during early morning or evening to reduce evaporation.`;
  } else if (temp > 32 && humidity < 40) {
    irrigationAdvisory = `Hot and dry conditions (${temp}°C, ${humidity}% humidity). Monitor soil moisture closely and irrigate if needed.`;
  } else {
    irrigationAdvisory = `Normal conditions for irrigation. Follow your regular schedule. Current temperature: ${temp}°C.`;
  }

  // General Advisory
  if (temp > 40) {
    generalAdvisory = `⚠️ Extreme heat alert: ${temp}°C. Provide shade to nursery plants. Ensure livestock have access to water.`;
  } else if (temp < 8) {
    generalAdvisory = `⚠️ Cold wave risk: ${temp}°C. Protect crops from frost. Use mulching or cover sheets for sensitive crops.`;
  } else if (rainProb > 80) {
    generalAdvisory = `Heavy rainfall likely. Ensure proper field drainage. Secure harvested produce under cover.`;
  } else if (condition && condition.toLowerCase().includes('storm')) {
    generalAdvisory = `Storm warning. Secure structures and avoid field work. Move equipment to safe locations.`;
  } else {
    generalAdvisory = `Weather conditions are normal for farming activities. Current: ${condition || 'Clear'}, ${temp}°C.`;
  }

  return { sprayingAdvisory, irrigationAdvisory, generalAdvisory };
}

// ─── Weather Alert Generator ─────────────────────────────────────────
/**
 * Generates weather-based alerts for the alerts system.
 * Returns an array of alert objects (may be empty if no alerts needed).
 */
export function generateWeatherAlerts(weatherData) {
  if (!weatherData || weatherData.isDemo) return [];

  const alerts = [];
  const { temp, humidity, windSpeed, rainProb, rainfall, condition } = weatherData;

  if (rainProb > 75) {
    alerts.push({
      alert_type: 'weather',
      priority: rainProb > 90 ? 'High' : 'Medium',
      title: 'Heavy Rainfall Expected',
      message: `${rainProb}% probability of rain in ${weatherData.location || 'your area'}. Ensure proper field drainage and secure harvested produce.`,
      reason: `Rain probability ${rainProb}% exceeds 75% threshold`
    });
  }

  if (temp > 40) {
    alerts.push({
      alert_type: 'weather',
      priority: 'High',
      title: 'Extreme Heat Alert',
      message: `Temperature is ${temp}°C in ${weatherData.location || 'your area'}. Provide shade, increase irrigation, and avoid mid-day field work.`,
      reason: `Temperature ${temp}°C exceeds 40°C threshold`
    });
  }

  if (temp < 5) {
    alerts.push({
      alert_type: 'weather',
      priority: 'High',
      title: 'Frost/Cold Wave Warning',
      message: `Temperature dropped to ${temp}°C. Protect sensitive crops with covers. Use mulching for frost protection.`,
      reason: `Temperature ${temp}°C below 5°C threshold`
    });
  }

  if (windSpeed > 40) {
    alerts.push({
      alert_type: 'weather',
      priority: 'High',
      title: 'High Wind Warning',
      message: `Wind speed is ${windSpeed} km/h. Secure structures, avoid spraying, and stake tall crops.`,
      reason: `Wind speed ${windSpeed} km/h exceeds 40 km/h threshold`
    });
  }

  if (humidity > 90 && temp > 25) {
    alerts.push({
      alert_type: 'weather',
      priority: 'Medium',
      title: 'Fungal Disease Risk',
      message: `High humidity (${humidity}%) with warm temperature (${temp}°C) creates favorable conditions for fungal diseases. Inspect crops closely.`,
      reason: `Humidity ${humidity}% > 90% and temp ${temp}°C > 25°C`
    });
  }

  return alerts;
}

// ─── Main Service ────────────────────────────────────────────────────
export const weatherService = {
  getCurrentWeather: async (location) => {
    if (!location || !location.trim()) {
      console.warn("Weather Service: No location provided");
      return { ...DEMO_CURRENT_WEATHER, location: "No Location", demoReason: WEATHER_ERRORS.MISSING_LOCATION };
    }

    try {
      const { data, error } = await supabase.functions.invoke('weather_api', {
        body: { location: location.trim(), action: 'current' }
      });

      if (error) {
        // Supabase Edge Function returned an error
        const classified = classifyWeatherError(error);
        console.error(`Weather Service Error (Current) [${classified.code}]:`, error);
        return {
          ...DEMO_CURRENT_WEATHER,
          location: location,
          demoReason: classified.message
        };
      }

      // Check if the Edge Function itself returned an error in the body
      if (data?.error) {
        const classified = classifyWeatherError({ message: data.error });
        console.error(`Weather API Error (Current) [${classified.code}]:`, data.error);
        return {
          ...DEMO_CURRENT_WEATHER,
          location: location,
          demoReason: classified.message
        };
      }

      // Success — real data
      return {
        ...data,
        isDemo: false,
        demoReason: null
      };

    } catch (err) {
      const classified = classifyWeatherError(err);
      console.error(`Weather Service Exception (Current) [${classified.code}]:`, err);
      return {
        ...DEMO_CURRENT_WEATHER,
        location: location,
        demoReason: classified.message
      };
    }
  },

  getForecast: async (location) => {
    if (!location || !location.trim()) {
      return DEMO_FORECAST;
    }

    try {
      const { data, error } = await supabase.functions.invoke('weather_api', {
        body: { location: location.trim(), action: 'forecast' }
      });

      if (error) {
        console.error("Weather Service Error (Forecast):", error);
        return DEMO_FORECAST;
      }

      if (data?.error) {
        console.error("Weather API Error (Forecast):", data.error);
        return DEMO_FORECAST;
      }

      // If the Edge Function returned an array (forecast days), mark them as real
      if (Array.isArray(data)) {
        return data.map(day => ({ ...day, isDemo: false }));
      }

      return DEMO_FORECAST;

    } catch (err) {
      console.error("Weather Service Exception (Forecast):", err);
      return DEMO_FORECAST;
    }
  },

  /**
   * Get farming impact advisories from current weather data.
   * @param {object} weatherData - Current weather data object
   * @returns {{ sprayingAdvisory, irrigationAdvisory, generalAdvisory }}
   */
  getFarmingImpact: (weatherData) => {
    return generateFarmingImpact(weatherData);
  },

  /**
   * Get weather-based alerts for the alerts system.
   * @param {object} weatherData - Current weather data object
   * @returns {Array} Array of alert objects
   */
  getWeatherAlerts: (weatherData) => {
    return generateWeatherAlerts(weatherData);
  }
};
