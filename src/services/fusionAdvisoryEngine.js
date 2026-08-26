/**
 * Fusion Advisory Engine — KrishiSetu
 *
 * Combines disease detection, weather forecast, and market trend data
 * into ONE unified recommendation for the farmer.
 *
 * Pure logic only — no API calls, no side effects, fully unit-testable.
 *
 * @module fusionAdvisoryEngine
 */

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Check if rain is forecast within the next 48 hours.
 * Accepts either a 7-day forecast array or a current weather object.
 * @param {Array|Object} weatherForecast
 * @returns {{ isRainExpected: boolean, nextDryDay: string|null }}
 */
function checkRainWithin48hrs(weatherForecast) {
  // Handle current weather object (single day)
  if (!Array.isArray(weatherForecast)) {
    const rainProb = weatherForecast?.rainProb ?? 0;
    return {
      isRainExpected: rainProb > 50,
      nextDryDay: rainProb > 50 ? null : 'today'
    };
  }

  // Handle forecast array — check first 2 entries (~48hrs)
  const next48hrs = weatherForecast.slice(0, 2);
  const isRainExpected = next48hrs.some(day => (day.rainProb ?? 0) > 50);

  // Find the next dry window (rainProb <= 50) after the rain
  let nextDryDay = null;
  if (isRainExpected) {
    const dryDay = weatherForecast.find((day, i) => i >= 1 && (day.rainProb ?? 0) <= 50);
    nextDryDay = dryDay ? dryDay.day : null;
  }

  return { isRainExpected, nextDryDay };
}

/**
 * Determine if a disease was actually detected (not healthy, not unavailable).
 * @param {Object} diseaseResult
 * @returns {boolean}
 */
function isDiseaseDetected(diseaseResult) {
  if (!diseaseResult) return false;
  const name = (diseaseResult.disease || '').toLowerCase();
  return (
    !name.includes('healthy') &&
    !name.includes('unavailable') &&
    !name.includes('unknown') &&
    diseaseResult.confidence > 0
  );
}

/**
 * Build an irrigation tip from weather data.
 * @param {Object|Array} weatherForecast
 * @returns {string}
 */
function getIrrigationTip(weatherForecast) {
  const weather = Array.isArray(weatherForecast) ? weatherForecast[0] : weatherForecast;
  if (!weather) return 'Check local weather for irrigation guidance.';

  const rainProb = weather.rainProb ?? 0;
  const temp = weather.temp ?? 0;

  if (rainProb > 70) {
    return `Rain expected (${rainProb}% probability). Skip irrigation today to avoid waterlogging.`;
  }
  if (temp > 35) {
    return `High temperature (${temp}°C). Water crops during early morning or evening to reduce evaporation.`;
  }
  if (rainProb > 40) {
    return `Moderate rain chance (${rainProb}%). Monitor conditions before irrigating.`;
  }
  return `Normal conditions (${temp}°C). Follow your regular irrigation schedule.`;
}

/**
 * Build a price trend summary sentence.
 * @param {Object|null} marketTrend - Enriched market item
 * @returns {string}
 */
function getPriceTrendSummary(marketTrend) {
  if (!marketTrend || !marketTrend.currentPrice) {
    return 'Market price data is currently unavailable.';
  }

  const { crop, currentPrice, trend, percentChange, recommendation, market } = marketTrend;
  const trendWord = trend === 'up' ? 'rising' : trend === 'down' ? 'falling' : 'stable';
  const marketName = market ? ` at ${market}` : '';

  return `${crop || 'Crop'} price is ₹${currentPrice}/quintal${marketName} (${trendWord}, ${percentChange > 0 ? '+' : ''}${percentChange}%). Market recommendation: ${recommendation || 'Hold'}.`;
}

// ─── Main Engine ─────────────────────────────────────────────────────

/**
 * Generate a unified Fusion Advisory by cross-referencing disease,
 * weather, and market data.
 *
 * @param {Object} diseaseResult - From diseaseService.detectDisease()
 *   { disease, confidence, crop, severity, isUncertain, isRealAI, ... }
 * @param {Array|Object} weatherForecast - From weatherService.getForecast()
 *   [{ day, temp, condition, rainProb }] or getCurrentWeather() object
 * @param {Object|null} marketTrend - From marketAnalytics.enrichMarketItem()
 *   { crop, currentPrice, trend, percentChange, recommendation, ... }
 * @returns {{ headline: string, reasoning: string[], action: string, urgency: 'low'|'medium'|'high'|'info' }}
 */
export function generateFusionAdvisory(diseaseResult, weatherForecast, marketTrend) {
  // ── Guard: no disease result at all ────────────────────────────────
  if (!diseaseResult) {
    return {
      headline: 'No diagnosis available',
      reasoning: ['Upload a leaf image to receive a fusion advisory.'],
      action: 'Upload a clear leaf photo to begin diagnosis.',
      urgency: 'info'
    };
  }

  // ── Rule D: Confidence < 60% (inconclusive) ───────────────────────
  if (diseaseResult.confidence < 60 || diseaseResult.isUncertain) {
    return {
      headline: 'Diagnosis Inconclusive — Manual Inspection Recommended',
      reasoning: [
        `AI confidence is only ${diseaseResult.confidence}%, which is below the 60% precision threshold.`,
        'Automated spray and sell recommendations are skipped to avoid acting on uncertain data.',
        'A clearer, well-lit close-up photo may improve accuracy.'
      ],
      action: 'Visit your nearest Krishi Vigyan Kendra (KVK) for in-person leaf diagnosis.',
      urgency: 'medium'
    };
  }

  // ── Rule C: No disease detected (healthy plant) ────────────────────
  if (!isDiseaseDetected(diseaseResult)) {
    const irrigationTip = getIrrigationTip(weatherForecast);
    const priceSummary = getPriceTrendSummary(marketTrend);

    return {
      headline: '✅ Crop Healthy — No Disease Detected',
      reasoning: [
        `${diseaseResult.crop || 'Plant'} leaf appears healthy with ${diseaseResult.confidence}% confidence.`,
        irrigationTip,
        priceSummary
      ],
      action: 'Continue regular crop care. Monitor leaves weekly for early signs of disease.',
      urgency: 'low'
    };
  }

  // ── Disease IS detected — build combined advisory ──────────────────
  const reasoning = [];
  let action = '';
  let urgency = 'medium';
  const diseaseName = diseaseResult.disease || 'Unknown Disease';
  const crop = diseaseResult.crop || 'Crop';

  reasoning.push(
    `${diseaseName} detected in ${crop} with ${diseaseResult.confidence}% confidence (Severity: ${diseaseResult.severity}).`
  );

  // Rule A: Disease + rain within 48hrs → delay spray
  const { isRainExpected, nextDryDay } = checkRainWithin48hrs(weatherForecast);

  if (isRainExpected) {
    const dryWindowNote = nextDryDay
      ? ` Next dry window expected on ${nextDryDay}.`
      : ' No dry window visible in the forecast — monitor daily.';
    reasoning.push(
      `Rain is forecast within the next 48 hours. Delaying spray is recommended to avoid wash-off.${dryWindowNote}`
    );
    action = `Delay fungicide/pesticide application until the rain passes.${nextDryDay ? ` Spray on ${nextDryDay} if conditions are clear.` : ''}`;
    urgency = 'high';
  } else {
    reasoning.push('No rain expected in the next 48 hours — spraying conditions are favorable.');
    action = `Apply recommended treatment for ${diseaseName} as soon as possible.`;
  }

  // Rule B: Severity High + confidence >= 80% → early partial sale
  if (diseaseResult.severity === 'High' && diseaseResult.confidence >= 80) {
    const priceNote = marketTrend && marketTrend.currentPrice
      ? ` Current mandi price: ₹${marketTrend.currentPrice}/quintal (${marketTrend.market || 'local market'}).`
      : '';
    reasoning.push(
      `High severity with strong confidence (${diseaseResult.confidence}%) — consider an early partial sale of harvested produce to limit loss.${priceNote}`
    );
    urgency = 'high';
  }

  // Add price context for all disease cases
  const priceSummary = getPriceTrendSummary(marketTrend);
  reasoning.push(priceSummary);

  // Build headline
  const headline = isRainExpected
    ? `⚠️ ${diseaseName} + Rain Alert — Delay Spray`
    : diseaseResult.severity === 'High'
      ? `🚨 ${diseaseName} — High Severity, Act Now`
      : `⚠️ ${diseaseName} — Treatment Recommended`;

  return {
    headline,
    reasoning,
    action,
    urgency
  };
}
