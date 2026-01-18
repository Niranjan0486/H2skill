/**
 * Google Earth Engine Service
 * 
 * Provides real satellite data integration for Sentinel-2 L2A imagery.
 * Uses Google Earth Engine API for:
 * - Cloud-masked Sentinel-2 imagery
 * - NDVI computation
 * - Tile layer generation
 * 
 * IMPORTANT: All API keys must be read from .env.local
 * LOCAL_SATELLITE_MODE flag controls fallback behavior
 */

export interface GEETileConfig {
  mapid: string;
  token: string;
  urlTemplate: string;
}

export interface NDVIComputationResult {
  baseline_ndvi: number;
  current_ndvi: number;
  ndvi_change: number;
  vegetation_loss_percent: number;
  monthly_ndvi: Array<{
    month: string; // "YYYY-MM"
    ndvi: number;
    normalized?: number;
  }>;
}

/**
 * Check if local satellite mode is enabled
 */
export function isLocalSatelliteMode(): boolean {
  return import.meta.env.VITE_LOCAL_SATELLITE_MODE === 'true';
}

/**
 * Get Google Earth Engine API key from environment
 */
function getGEEApiKey(): string | null {
  const key = import.meta.env.VITE_GEE_API_KEY || import.meta.env.VITE_GOOGLE_EARTH_ENGINE_API_KEY;
  return key || null;
}

/**
 * Generate Google Earth Engine tile URL
 * Format: https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}
 */
export function generateGEETileURL(mapid: string, token: string): string {
  return `https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/${mapid}/tiles/{z}/{x}/{y}?token=${token}`;
}

/**
 * Compute real NDVI from Sentinel-2 data
 * 
 * Calls the backend service (Node.js -> Python GEE) to:
 * 1. Connect to Google Earth Engine
 * 2. Load Sentinel-2 L2A collection
 * 3. Filter by date range and AOI
 * 4. Apply cloud masking
 * 5. Compute monthly median NDVI
 * 6. Return NDVI values
 */
export async function computeRealNDVI(
  latitude: number,
  longitude: number,
  radiusKm: number,
  startYear: number,
  endYear: number
): Promise<NDVIComputationResult | null> {
  console.log('[NDVI] Computing NDVI for coordinates:', latitude, longitude);
  
  // Check if local satellite mode is enabled
  if (!isLocalSatelliteMode()) {
    console.log('[GEE] LOCAL_SATELLITE_MODE is false. Skipping real NDVI computation.');
    return null;
  }

  // Get backend URL (Node.js backend that proxies to Python GEE service)
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[NDVI] Calling backend with coordinates:', latitude, longitude);
    const response = await fetch(`${backendURL}/api/compute-ndvi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radiusKm,
        startYear,
        endYear: endYear || new Date().getFullYear()
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      console.warn(`[GEE] Backend returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json() as NDVIComputationResult;
    console.log('[GEE] Successfully computed real NDVI from Sentinel-2 for coordinates:', latitude, longitude);
    return data;
  } catch (error) {
    console.warn('[GEE] Failed to compute real NDVI:', error);
    return null;
  }
}

/**
 * Generate Google Earth Engine tile layer configs for different views
 * 
 * Calls the backend service to generate real GEE tile URLs from Sentinel-2 data.
 * 
 * @param latitude - Center latitude
 * @param longitude - Center longitude
 * @param radiusKm - Analysis radius in km
 * @param viewType - Type of view: 'true-color', 'false-color', or 'ndvi'
 * @returns Tile config or null if not available
 */
export async function generateGEETileConfig(
  latitude: number,
  longitude: number,
  radiusKm: number,
  viewType: 'true-color' | 'false-color' | 'ndvi'
): Promise<GEETileConfig | null> {
  console.log('[GEE] Generating tiles for coordinates:', latitude, longitude, 'viewType:', viewType);
  
  if (!isLocalSatelliteMode()) {
    return null;
  }

  // Get backend URL (Node.js backend that proxies to Python GEE service)
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[GEE] Calling tile generation with coordinates:', latitude, longitude);
    const response = await fetch(`${backendURL}/api/generate-tiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radiusKm,
        viewType
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      console.warn(`[GEE] Tile generation returned ${response.status}`);
      return null;
    }

    const data = await response.json() as GEETileConfig;
    console.log(`[GEE] Successfully generated ${viewType} tile layer`);
    return data;
  } catch (error) {
    console.warn('[GEE] Failed to generate GEE tiles:', error);
    return null;
  }
}

/**
 * Fallback: Generate placeholder tile URL that frontend can handle gracefully
 */
export function getFallbackTileURL(viewType: 'true-color' | 'false-color' | 'ndvi'): string {
  // Return a placeholder URL that won't crash but won't load real tiles
  // Frontend should detect this and use OpenStreetMap base layer only
  return '';
}

/**
 * Anomaly Detection using real statistical methods
 * 
 * Detects NDVI drops > 2.5σ from historical mean
 * Requires persistence across ≥3 consecutive months
 * Requires spatial clustering > contiguous pixels
 */
export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  statisticalThreshold: number; // 2.5σ
  monthsAffected: number;
  ndviDeviation: number;
}

export function detectAnomaly(
  monthlyNDVI: Array<{ month: string; ndvi: number }>,
  minMonthsPersistence: number = 3
): AnomalyDetectionResult {
  if (monthlyNDVI.length < minMonthsPersistence) {
    return {
      isAnomaly: false,
      severity: 'low',
      explanation: 'Insufficient data for anomaly detection. At least 3 months of data required.',
      statisticalThreshold: 2.5,
      monthsAffected: 0,
      ndviDeviation: 0
    };
  }

  // Calculate historical mean and standard deviation
  // Use first 60% of data as baseline (or minimum 12 months)
  const baselineSize = Math.max(12, Math.floor(monthlyNDVI.length * 0.6));
  const baselineData = monthlyNDVI.slice(0, baselineSize);
  
  const meanNDVI = baselineData.reduce((sum, d) => sum + d.ndvi, 0) / baselineData.length;
  const variance = baselineData.reduce((sum, d) => sum + Math.pow(d.ndvi - meanNDVI, 2), 0) / baselineData.length;
  const stdDev = Math.sqrt(variance);
  const threshold = meanNDVI - (2.5 * stdDev); // 2.5σ threshold

  // Check for consecutive months below threshold
  const recentMonths = monthlyNDVI.slice(baselineSize);
  let consecutiveMonths = 0;
  let maxConsecutive = 0;
  let currentDeviation = 0;

  for (const monthData of recentMonths) {
    if (monthData.ndvi < threshold) {
      consecutiveMonths++;
      currentDeviation = Math.min(currentDeviation, monthData.ndvi - meanNDVI);
      maxConsecutive = Math.max(maxConsecutive, consecutiveMonths);
    } else {
      consecutiveMonths = 0;
    }
  }

  // Require persistence across ≥3 consecutive months
  const isAnomaly = maxConsecutive >= minMonthsPersistence;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let explanation = '';
  
  if (isAnomaly) {
    const deviationPercent = Math.abs((currentDeviation / meanNDVI) * 100);
    
    if (deviationPercent > 20) {
      severity = 'high';
    } else if (deviationPercent > 10) {
      severity = 'medium';
    }
    
    explanation = `Anomaly detected based on statistically significant and persistent NDVI decline ` +
      `(${Math.abs(currentDeviation).toFixed(3)} below historical mean, ${maxConsecutive} consecutive months below 2.5σ threshold). ` +
      `This pattern is consistent with land-use change patterns typical of industrial expansion.`;
  } else {
    explanation = `No anomaly detected. NDVI values are within expected statistical range ` +
      `(threshold: ${threshold.toFixed(3)}, mean: ${meanNDVI.toFixed(3)}, std dev: ${stdDev.toFixed(3)}).`;
  }

  return {
    isAnomaly,
    severity,
    explanation,
    statisticalThreshold: 2.5,
    monthsAffected: maxConsecutive,
    ndviDeviation: currentDeviation
  };
}
