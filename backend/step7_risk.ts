/**
 * STEP 7: Deforestation Risk Classification
 * 
 * Uses explainable rules to classify risk level:
 * - HIGH RISK: NDVI drop > 20% over 12 months
 * - MEDIUM RISK: NDVI drop between 10-20%
 * - LOW RISK: Otherwise
 * 
 * Also considers:
 * - Number of significant drops
 * - Overall trend direction
 * - Confidence based on data quality
 */

import { TrendAnalysis, NDVIData, RiskClassification } from './types';

/**
 * Classifies deforestation risk based on NDVI trend analysis
 * @param trendAnalysis - Trend analysis results
 * @param ndviData - NDVI data points (for confidence calculation)
 * @returns Risk classification with level, confidence, and reason
 */
export function classifyRisk(
  trendAnalysis: TrendAnalysis,
  ndviData: NDVIData[]
): RiskClassification {
  const { overallTrend, ndviChange, significantDrops } = trendAnalysis;

  // Calculate confidence based on data quality
  // More data points = higher confidence
  let confidence = Math.min(1.0, ndviData.length / 12); // Full confidence at 12+ months
  if (ndviData.length < 3) {
    confidence = 0.5; // Low confidence with very few data points
  }

  // Risk classification rules (explainable)
  let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  let reason: string;

  // HIGH RISK: Significant vegetation loss
  if (ndviChange < -20) {
    riskLevel = 'HIGH';
    reason = `Detected ${Math.abs(ndviChange).toFixed(1)}% reduction in vegetation index over the monitoring period. `;
    
    if (significantDrops.length > 0) {
      reason += `${significantDrops.length} significant drop(s) detected, indicating potential deforestation events. `;
    }
    
    reason += `The sustained downward trend suggests ongoing vegetation loss in the area.`;
    confidence = Math.max(confidence, 0.7); // High confidence for large drops

  // MEDIUM RISK: Moderate vegetation loss
  } else if (ndviChange < -10) {
    riskLevel = 'MEDIUM';
    reason = `Detected ${Math.abs(ndviChange).toFixed(1)}% reduction in vegetation index, indicating moderate vegetation loss. `;
    
    if (significantDrops.length > 0) {
      reason += `${significantDrops.length} notable drop(s) observed. `;
    } else {
      reason += `Gradual decline suggests incremental vegetation reduction. `;
    }
    
    reason += `Monitoring recommended to assess if trend continues.`;

  // LOW RISK: Stable or improving
  } else if (overallTrend === 'increasing' || ndviChange > 5) {
    riskLevel = 'LOW';
    reason = `Vegetation index shows ${ndviChange > 0 ? 'improvement' : 'stability'} (${ndviChange > 0 ? '+' : ''}${ndviChange.toFixed(1)}%). `;
    reason += `No significant vegetation loss detected in the monitored area.`;
    
  } else {
    riskLevel = 'LOW';
    reason = `Vegetation change is within acceptable range (${ndviChange.toFixed(1)}%). `;
    
    if (significantDrops.length > 0) {
      reason += `Some localized drops detected, but overall trend remains stable. `;
    }
    
    reason += `Continued monitoring recommended.`;
  }

  // Adjust confidence based on data points and trend consistency
  if (ndviData.length >= 6 && overallTrend === 'decreasing') {
    confidence = Math.min(1.0, confidence + 0.1); // Boost confidence with more data
  }

  return {
    riskLevel,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    reason: reason.trim()
  };
}

