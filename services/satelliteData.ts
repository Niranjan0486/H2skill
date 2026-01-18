/**
 * Satellite Data Service
 * 
 * Service for fetching real satellite-derived NDVI data.
 * Integrates with backend or processes data locally when available.
 */

import { NDVIComputationResult, detectAnomaly, isLocalSatelliteMode } from './gee';
import type { NDVIData } from '../backend/types';

/**
 * Compute NDVI trend from satellite imagery
 * 
 * This function will:
 * 1. Accept factory coordinates + buffer radius (5km)
 * 2. Fetch Sentinel-2 imagery from establishment year → present
 * 3. Apply cloud masking
 * 4. Compute monthly NDVI
 * 5. Return monthly mean NDVI, baseline, current, and delta
 */
export async function computeNDVITrend(
  latitude: number,
  longitude: number,
  radiusKm: number,
  startYear: number
): Promise<{
  baseline_ndvi: number;
  current_ndvi: number;
  ndvi_change: number;
  vegetation_loss_percent: number;
  monthly_ndvi: Array<{ month: string; ndvi: number; normalized?: number }>;
  anomaly?: {
    isAnomaly: boolean;
    severity: string;
    explanation: string;
  };
}> {
  const currentYear = new Date().getFullYear();
  
  // Try to get real data if LOCAL_SATELLITE_MODE is enabled
  let monthlyNDVI: Array<{ month: string; ndvi: number }> = [];
  
  if (isLocalSatelliteMode()) {
    // Call real GEE backend service
    const { computeRealNDVI } = await import('./gee');
    const realData = await computeRealNDVI(
      latitude,
      longitude,
      radiusKm,
      startYear,
      currentYear
    );
    
    if (realData && realData.monthly_ndvi.length > 0) {
      // Use real satellite data
      monthlyNDVI = realData.monthly_ndvi.map(m => ({
        month: m.month,
        ndvi: m.ndvi
      }));
      
      // Return real data immediately
      return {
        baseline_ndvi: realData.baseline_ndvi,
        current_ndvi: realData.current_ndvi,
        ndvi_change: realData.ndvi_change,
        vegetation_loss_percent: realData.vegetation_loss_percent,
        monthly_ndvi: realData.monthly_ndvi,
        anomaly: undefined // Will be computed below
      };
    }
  }
  
  // Fallback: If real data is not available, return empty structure
  // The backend pipeline will handle mock data generation if needed
  // Frontend should gracefully handle empty data
  if (monthlyNDVI.length === 0) {
    console.warn('[SatelliteData] No real data available and no fallback. Returning empty structure.');
    return {
      baseline_ndvi: 0,
      current_ndvi: 0,
      ndvi_change: 0,
      vegetation_loss_percent: 0,
      monthly_ndvi: [],
      anomaly: undefined
    };
  }
  
  // Calculate baseline and current NDVI (if not already computed from real data)
  const baseline_ndvi = monthlyNDVI[0]?.ndvi || 0;
  const current_ndvi = monthlyNDVI[monthlyNDVI.length - 1]?.ndvi || 0;
  const ndvi_change = current_ndvi - baseline_ndvi;
  const vegetation_loss_percent = baseline_ndvi > 0 
    ? Math.abs((ndvi_change / baseline_ndvi) * 100) 
    : 0;
  
  // Apply seasonal normalization (5-year rolling mean)
  const normalized = applySeasonalNormalization(monthlyNDVI);
  
  // Detect anomalies using real statistical methods
  const anomalyResult = detectAnomaly(monthlyNDVI);
  
  return {
    baseline_ndvi,
    current_ndvi,
    ndvi_change,
    vegetation_loss_percent,
    monthly_ndvi: monthlyNDVI.map((m, i) => ({
      ...m,
      normalized: normalized[i]?.normalized
    })),
    anomaly: anomalyResult.isAnomaly ? {
      isAnomaly: true,
      severity: anomalyResult.severity,
      explanation: anomalyResult.explanation
    } : undefined
  };
}

/**
 * Apply seasonal normalization using 5-year rolling mean
 */
function applySeasonalNormalization(
  monthlyNDVI: Array<{ month: string; ndvi: number }>
): Array<{ month: string; normalized: number }> {
  const normalized: Array<{ month: string; normalized: number }> = [];
  
  // Group by month (Jan, Feb, etc.)
  const monthGroups: { [month: number]: number[] } = {};
  
  monthlyNDVI.forEach(item => {
    const [, monthStr] = item.month.split('-');
    const month = parseInt(monthStr);
    if (!monthGroups[month]) {
      monthGroups[month] = [];
    }
    monthGroups[month].push(item.ndvi);
  });
  
  // Calculate 5-year rolling mean for each month
  const monthlyMeans: { [month: number]: number } = {};
  Object.keys(monthGroups).forEach(monthStr => {
    const month = parseInt(monthStr);
    const values = monthGroups[month];
    // Use recent 5 years or all available if less than 5 years
    const recentValues = values.slice(-60).slice(-5); // Last 5 occurrences
    monthlyMeans[month] = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
  });
  
  // Apply normalization
  monthlyNDVI.forEach(item => {
    const [, monthStr] = item.month.split('-');
    const month = parseInt(monthStr);
    const mean = monthlyMeans[month] || item.ndvi;
    // Normalize by subtracting seasonal mean and adding overall mean
    const overallMean = monthlyNDVI.reduce((sum, m) => sum + m.ndvi, 0) / monthlyNDVI.length;
    normalized.push({
      month: item.month,
      normalized: item.ndvi - mean + overallMean
    });
  });
  
  return normalized;
}
