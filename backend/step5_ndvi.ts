/**
 * STEP 5: NDVI Calculation
 * 
 * Normalized Difference Vegetation Index (NDVI)
 * Formula: NDVI = (NIR - Red) / (NIR + Red)
 * 
 * NDVI ranges from -1 to +1:
 * - Negative values: Water, clouds, snow
 * - 0.0 to 0.2: Barren or sparse vegetation
 * - 0.2 to 0.5: Sparse vegetation, shrubs
 * - 0.5 to 0.8: Dense vegetation, healthy forest
 * - > 0.8: Very dense vegetation
 * 
 * For each month, we calculate mean NDVI over the AOI.
 */

import { SatelliteImageData, NDVIData } from './types';

/**
 * Calculates NDVI from Red and Near-Infrared band values
 * @param red - Red band (B4) value
 * @param nir - Near-Infrared band (B8) value
 * @returns NDVI value (-1 to 1)
 */
export function calculateNDVI(red: number, nir: number): number {
  if (red === 0 && nir === 0) {
    return 0; // Invalid data
  }

  const denominator = nir + red;
  if (denominator === 0) {
    return 0; // Avoid division by zero
  }

  const ndvi = (nir - red) / denominator;

  // Clamp to valid range
  return Math.max(-1, Math.min(1, ndvi));
}

/**
 * Calculates mean NDVI for each month from satellite data
 * @param satelliteData - Array of satellite image data
 * @returns Array of NDVI data points
 */
export function calculateNDVITrend(
  satelliteData: SatelliteImageData[]
): NDVIData[] {
  const ndviData: NDVIData[] = [];

  for (const data of satelliteData) {
    if (!data.isValid) {
      // Skip invalid data (high cloud cover, etc.)
      continue;
    }

    const meanNDVI = calculateNDVI(data.red, data.nir);
    
    ndviData.push({
      month: data.month,
      meanNDVI: Math.round(meanNDVI * 1000) / 1000 // Round to 3 decimal places
    });
  }

  return ndviData.sort((a, b) => a.month.localeCompare(b.month));
}

