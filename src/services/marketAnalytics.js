/**
 * Market Analytics Engine — KrishiSetu
 * 
 * Provides real data-driven trend calculation and sell/hold recommendations.
 * No Math.random(). All calculations are based on actual price data.
 * 
 * IMPORTANT: Recommendations are informational only, not financial advice.
 */

// ─── Trend Calculation ───────────────────────────────────────────────
/**
 * Calculate price trend from current and previous prices.
 * @param {number} currentPrice - Current/modal price
 * @param {number} previousPrice - Previous period price
 * @returns {{ direction: string, percentChange: number, absoluteChange: number }}
 */
export function calculateTrend(currentPrice, previousPrice) {
  if (!currentPrice || !previousPrice || previousPrice === 0) {
    return { direction: 'stable', percentChange: 0, absoluteChange: 0 };
  }

  const absoluteChange = currentPrice - previousPrice;
  const percentChange = ((absoluteChange) / previousPrice) * 100;

  // Threshold: less than 1% change is considered stable
  let direction = 'stable';
  if (percentChange > 1) direction = 'up';
  else if (percentChange < -1) direction = 'down';

  return {
    direction,
    percentChange: Math.round(percentChange * 100) / 100, // 2 decimal places
    absoluteChange: Math.round(absoluteChange)
  };
}

// ─── Sell/Hold Recommendation ────────────────────────────────────────
/**
 * Generate an explainable sell/hold recommendation based on available price data.
 * This is informational only — NOT financial advice.
 * 
 * @param {string} crop - Crop name
 * @param {number} currentPrice - Current modal price (₹/quintal)
 * @param {number} previousPrice - Previous price for comparison
 * @param {{ direction: string, percentChange: number }} trend - Calculated trend
 * @param {number|null} minPrice - Minimum price if available
 * @param {number|null} maxPrice - Maximum price if available
 * @returns {{ recommendation: string, confidence: string, explanation: string, factors: string[] }}
 */
export function generateSellHoldAdvice(crop, currentPrice, previousPrice, trend, minPrice = null, maxPrice = null) {
  if (!currentPrice || !trend) {
    return {
      recommendation: 'Hold',
      confidence: 'Low',
      explanation: 'Insufficient price data to make a recommendation.',
      factors: ['Price data is unavailable or incomplete.']
    };
  }

  const factors = [];
  let score = 0; // Positive = sell signal, Negative = hold signal

  // Factor 1: Current trend direction
  if (trend.direction === 'up' && trend.percentChange > 5) {
    score += 2;
    factors.push(`Prices have increased by ${trend.percentChange}% — strong upward momentum.`);
  } else if (trend.direction === 'up' && trend.percentChange > 2) {
    score += 1;
    factors.push(`Prices are rising moderately (+${trend.percentChange}%).`);
  } else if (trend.direction === 'down' && trend.percentChange < -5) {
    score -= 2;
    factors.push(`Prices are declining (${trend.percentChange}%). Holding may allow for recovery.`);
  } else if (trend.direction === 'down') {
    score -= 1;
    factors.push(`Slight price decline (${trend.percentChange}%). Market may stabilize.`);
  } else {
    factors.push(`Prices are relatively stable (${trend.percentChange}% change).`);
  }

  // Factor 2: Price relative to min-max range
  if (minPrice && maxPrice && maxPrice > minPrice) {
    const range = maxPrice - minPrice;
    const position = (currentPrice - minPrice) / range;

    if (position > 0.75) {
      score += 2;
      factors.push(`Current price (₹${currentPrice}) is near the daily high (₹${maxPrice}).`);
    } else if (position > 0.5) {
      score += 1;
      factors.push(`Current price is above the mid-range between ₹${minPrice} and ₹${maxPrice}.`);
    } else if (position < 0.25) {
      score -= 1;
      factors.push(`Current price (₹${currentPrice}) is near the daily low (₹${minPrice}). May recover.`);
    }
  }

  // Factor 3: Absolute price level consideration
  if (currentPrice > previousPrice && trend.absoluteChange > 200) {
    score += 1;
    factors.push(`Significant absolute increase of ₹${trend.absoluteChange}/quintal.`);
  }

  // Determine recommendation
  let recommendation, confidence;
  if (score >= 3) {
    recommendation = 'Sell';
    confidence = 'Moderate';
  } else if (score >= 1) {
    recommendation = 'Sell';
    confidence = 'Low';
  } else if (score <= -2) {
    recommendation = 'Hold';
    confidence = 'Moderate';
  } else {
    recommendation = 'Hold';
    confidence = 'Low';
  }

  const explanation = recommendation === 'Sell'
    ? `Based on current market data, ${crop} prices appear favorable for selling. ${factors[0]}`
    : `Based on current market data, holding ${crop} stock may be advisable. ${factors[0]}`;

  return {
    recommendation,
    confidence,
    explanation,
    factors
  };
}

// ─── Price Data Formatting ───────────────────────────────────────────
/**
 * Format market price item with computed trend and recommendation.
 * @param {object} item - Raw market price data from DB or API
 * @returns {object} Enriched price item with trend and recommendation
 */
export function enrichMarketItem(item) {
  const currentPrice = item.modal_price || item.max_price || item.currentPrice || 0;
  const previousPrice = item.min_price || item.previousPrice || currentPrice;
  const trend = calculateTrend(currentPrice, previousPrice);
  const advice = generateSellHoldAdvice(
    item.crop_name || item.crop,
    currentPrice,
    previousPrice,
    trend,
    item.min_price || null,
    item.max_price || null
  );

  return {
    id: item.id,
    crop: item.crop_name || item.crop,
    market: item.market_name || item.market,
    state: item.state || null,
    currentPrice,
    previousPrice,
    minPrice: item.min_price || null,
    maxPrice: item.max_price || null,
    trend: trend.direction,
    percentChange: trend.percentChange,
    absoluteChange: trend.absoluteChange,
    recommendation: advice.recommendation,
    recommendationConfidence: advice.confidence,
    recommendationExplanation: advice.explanation,
    recommendationFactors: advice.factors,
    recordedDate: item.recorded_date || item.recordedDate || null,
    isDemo: item.isDemo || false
  };
}
