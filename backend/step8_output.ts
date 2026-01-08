/**
 * STEP 8: Evidence Generation & Output Formatting
 * 
 * Prepares frontend-ready outputs:
 * - NDVI trend time-series (for graph visualization)
 * - Summary text
 * - Metadata
 * - Disclaimer
 * 
 * Formats the final JSON response for the frontend.
 */

import { PipelineOutput, NDVIData, RiskClassification, FactoryInput, AOIBuffer, TimeWindow } from './types';

/**
 * Generates a human-readable location string
 * @param input - Factory input with coordinates
 * @returns Location string
 */
function getLocationString(input: FactoryInput): string {
  // For the demo location (Tiruppur), return known location
  if (Math.abs(input.latitude - 11.1085) < 0.01 && Math.abs(input.longitude - 77.3411) < 0.01) {
    return 'Tiruppur, Tamil Nadu';
  }
  
  // Generic format for other locations
  return `Lat: ${input.latitude.toFixed(4)}, Lng: ${input.longitude.toFixed(4)}`;
}

/**
 * Generates AI summary text based on analysis
 * @param input - Factory input
 * @param ndviData - NDVI trend data
 * @param riskClassification - Risk classification
 * @returns Summary text
 */
function generateSummary(
  input: FactoryInput,
  ndviData: NDVIData[],
  riskClassification: RiskClassification
): string {
  if (ndviData.length === 0) {
    return 'Insufficient satellite data available for analysis.';
  }

  const firstYear = ndviData[0].month.split('-')[0];
  const lastYear = ndviData[ndviData.length - 1].month.split('-')[0];
  
  let summary = `Satellite analysis from ${firstYear} to ${lastYear} `;
  
  if (riskClassification.riskLevel === 'HIGH') {
    summary += 'shows a sustained reduction in vegetation cover around the industrial area. ';
    summary += 'Multiple periods of significant vegetation loss were detected, indicating potential environmental impact.';
  } else if (riskClassification.riskLevel === 'MEDIUM') {
    summary += 'indicates moderate vegetation changes in the monitoring area. ';
    summary += 'Some reduction in vegetation index suggests ongoing environmental monitoring is warranted.';
  } else {
    summary += 'shows stable vegetation conditions in the monitored area. ';
    summary += 'No significant deforestation or vegetation loss patterns detected.';
  }

  summary += ` Analysis confidence: ${(riskClassification.confidence * 100).toFixed(0)}%.`;

  return summary;
}

/**
 * Formats the final pipeline output for frontend
 * @param input - Factory input
 * @param aoi - Area of Interest
 * @param timeWindow - Time window
 * @param ndviData - NDVI trend data
 * @param riskClassification - Risk classification
 * @returns Formatted pipeline output
 */
export function formatPipelineOutput(
  input: FactoryInput,
  aoi: AOIBuffer,
  timeWindow: TimeWindow,
  ndviData: NDVIData[],
  riskClassification: RiskClassification
): PipelineOutput {
  const location = getLocationString(input);
  const summary = generateSummary(input, ndviData, riskClassification);

  return {
    factory: input.factoryName,
    location,
    coordinates: [input.latitude, input.longitude],
    ndviTrend: ndviData,
    riskLevel: riskClassification.riskLevel,
    confidence: riskClassification.confidence,
    summary,
    disclaimer: 'This system detects vegetation change using satellite data and does not assert legal responsibility. Results are based on automated analysis and should be verified through ground truthing and regulatory review.',
    metadata: {
      aoiRadiusKm: aoi.radiusKm,
      timeWindow: `${timeWindow.startDate.getFullYear()} to ${timeWindow.endDate.getFullYear()}`,
      monthsAnalyzed: ndviData.length
    }
  };
}

