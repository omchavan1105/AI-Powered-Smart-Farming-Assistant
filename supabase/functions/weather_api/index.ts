import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, action } = await req.json()
    const apiKey = Deno.env.get('WEATHER_API_KEY');
    
    if (!apiKey) {
      throw new Error("WEATHER_API_KEY is not set in edge function secrets");
    }

    if (!location) {
      throw new Error("Location is required");
    }

    // Using WeatherAPI.com as an example, since it's easy and returns 7-day forecast nicely
    // If you prefer OpenWeatherMap, you can change the URL structure.
    
    let url = '';
    if (action === 'current') {
      url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`;
    } else if (action === 'forecast') {
      url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=7`;
    } else {
      throw new Error("Invalid action");
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Transform WeatherAPI response to our frontend format
    let result = {};
    if (action === 'current') {
      result = {
        temp: data.current.temp_c,
        feelsLike: data.current.feelslike_c,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        rainProb: 0, // Current doesn't have rain prob, default to 0
        rainfall: data.current.precip_mm,
        condition: data.current.condition.text,
        location: `${data.location.name}, ${data.location.region}`
      };
    } else {
      result = data.forecast.forecastday.map((day: any) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: day.day.avgtemp_c,
        condition: day.day.condition.text,
        rainProb: day.day.daily_chance_of_rain
      }));
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
