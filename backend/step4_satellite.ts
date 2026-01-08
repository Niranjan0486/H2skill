/**
 * STEP 4: Satellite Image Fetch (Sentinel-2)
 * 
 * For MVP/Hackathon:
 * - This module simulates fetching Sentinel-2 satellite imagery
 * - In production, integrate with Google Earth Engine, Sentinel Hub, or similar
 * 
 * For each month:
 * - Fetch imagery for AOI
 * - Filter cloud cover < 20%
 * - Retrieve bands: B4 (Red), B8 (Near Infrared)
 * 
 * NOTE: For MVP, we generate realistic mock data while keeping the logic intact.
 */

import { AOIBuffer, TimeWindow, SatelliteImageData } from './types';

/**
 * Simulates fetching Sentinel-2 satellite data
 * In production, this would call:
 * - Google Earth Engine API
 * - Sentinel Hub API
 * - Or similar geospatial data services
 * 
 * @param aoi - Area of Interest buffer
 * @param month - Month in "YYYY-MM" format
 * @returns Satellite image data with Red and NIR band values
 */
async function fetchSentinel2Data(
  aoi: AOIBuffer,
  month: string
): Promise<SatelliteImageData> {
  // MOCK IMPLEMENTATION for MVP
  // In production, replace with actual API calls
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Generate realistic mock data with some variability
  const [year, monthNum] = month.split('-').map(Number);
  const randomSeed = year * 12 + monthNum;

  // Simulate cloud cover (0-30%)
  const cloudCover = Math.random() * 30;

  // If cloud cover is too high, mark as invalid
  if (cloudCover >= 20) {
    return {
      month,
      red: 0,
      nir: 0,
      cloudCover,
      isValid: false
    };
  }

  // Generate realistic NDVI-related values
  // Red band (B4): typically 0-3000 for Sentinel-2
  // NIR band (B8): typically 0-10000 for Sentinel-2
  
  // Simulate gradual vegetation loss over time
  const monthsSinceStart = (year - 2017) * 12 + monthNum;
  const vegetationFactor = Math.max(0.5, 1.0 - (monthsSinceStart * 0.002)); // Gradual decline

  const baseRed = 2000;
  const baseNIR = 5000 * vegetationFactor;

  // Add some seasonal variation and noise
  const seasonalFactor = 1 + 0.1 * Math.sin((monthNum - 6) * Math.PI / 6); // Peak in monsoon
  const noise = (Math.random() - 0.5) * 0.2; // ±10% noise

  const red = Math.round(baseRed * (1 + noise));
  const nir = Math.round(baseNIR * seasonalFactor * (1 + noise));

  return {
    month,
    red,
    nir,
    cloudCover,
    isValid: true
  };
}

/**
 * Fetches satellite data for all months in time window
 * For MVP: Only process representative months (every 2-3 months) to speed up
 * 
 * @param aoi - Area of Interest
 * @param timeWindow - Time window with months
 * @param sampleEveryN - Process every Nth month (default: 2 for MVP)
 * @returns Array of satellite image data
 */
export async function fetchSatelliteDataForTimeWindow(
  aoi: AOIBuffer,
  timeWindow: TimeWindow,
  sampleEveryN: number = 2
): Promise<SatelliteImageData[]> {
  const results: SatelliteImageData[] = [];

  // For MVP, sample representative months to keep processing fast
  const monthsToProcess = timeWindow.months.filter((_, index) => index % sampleEveryN === 0);

  // Always include first and last months for baseline comparison
  if (monthsToProcess[0] !== timeWindow.months[0]) {
    monthsToProcess.unshift(timeWindow.months[0]);
  }
  if (monthsToProcess[monthsToProcess.length - 1] !== timeWindow.months[timeWindow.months.length - 1]) {
    monthsToProcess.push(timeWindow.months[timeWindow.months.length - 1]);
  }

  // Remove duplicates
  const uniqueMonths = Array.from(new Set(monthsToProcess));

  // Fetch data for each month
  for (const month of uniqueMonths) {
    const data = await fetchSentinel2Data(aoi, month);
    results.push(data);
  }

  return results;
}

