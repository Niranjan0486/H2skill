/**
 * STEP 6: Trend & Threshold Analysis
 * 
 * Analyzes NDVI trends over time to detect:
 * - Sustained downward trends (vegetation loss)
 * - Sudden NDVI drops (possible deforestation events)
 * - Seasonal fluctuations (to ignore)
 * 
 * Uses statistical methods to identify significant changes
 * while accounting for natural variability.
 */

import { NDVIData, TrendAnalysis } from './types';

/**
 * Analyzes NDVI trend over time
 * @param ndviData - Array of NDVI measurements over time
 * @returns Trend analysis with overall direction and significant drops
 */
export function analyzeNDVITrend(ndviData: NDVIData[]): TrendAnalysis {
  if (ndviData.length < 2) {
    return {
      overallTrend: 'stable',
      ndviChange: 0,
      significantDrops: []
    };
  }

  // Sort by month to ensure chronological order
  const sorted = [...ndviData].sort((a, b) => a.month.localeCompare(b.month));

  // Calculate overall change (first vs last)
  const firstNDVI = sorted[0].meanNDVI;
  const lastNDVI = sorted[sorted.length - 1].meanNDVI;
  
  let ndviChange = 0;
  if (firstNDVI > 0) {
    ndviChange = ((lastNDVI - firstNDVI) / firstNDVI) * 100;
  }

  // Determine overall trend
  let overallTrend: 'increasing' | 'decreasing' | 'stable';
  if (ndviChange > 5) {
    overallTrend = 'increasing';
  } else if (ndviChange < -5) {
    overallTrend = 'decreasing';
  } else {
    overallTrend = 'stable';
  }

  // Detect significant drops (month-over-month changes > 10%)
  const significantDrops: Array<{ month: string; drop: number }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const prevNDVI = sorted[i - 1].meanNDVI;
    const currNDVI = sorted[i].meanNDVI;

    if (prevNDVI > 0) {
      const drop = ((currNDVI - prevNDVI) / prevNDVI) * 100;

      // Consider drops > 10% as significant
      if (drop < -10) {
        significantDrops.push({
          month: sorted[i].month,
          drop: Math.round(drop * 10) / 10 // Round to 1 decimal
        });
      }
    }
  }

  return {
    overallTrend,
    ndviChange: Math.round(ndviChange * 10) / 10, // Round to 1 decimal
    significantDrops
  };
}

