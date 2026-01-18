/**
 * Google Earth Engine Service (Node.js)
 * 
 * This service interfaces with a Python backend that uses the GEE Python SDK
 * to process real Sentinel-2 satellite imagery.
 * 
 * The Python service must be running separately and accessible via HTTP.
 * 
 * LOCAL MODE: When LOCAL_SATELLITE_MODE=true, this service will attempt to
 * call the Python GEE backend. If unavailable, it gracefully falls back.
 */

// Check if local satellite mode is enabled (from environment)
function isLocalSatelliteMode(): boolean {
  return process.env.LOCAL_SATELLITE_MODE === 'true' || 
         process.env.VITE_LOCAL_SATELLITE_MODE === 'true';
}

export interface GEENDVIRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  startYear: number;
  endYear: number;
}

export interface GEENDVIResponse {
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

export interface GEETileRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  viewType: 'true-color' | 'false-color' | 'ndvi';
}

export interface GEETileResponse {
  mapid: string;
  token: string;
  urlTemplate: string;
}

/**
 * Get the Python GEE backend URL from environment
 */
function getGEEBackendURL(): string | null {
  const url = process.env.GEE_PYTHON_BACKEND_URL || 
              process.env.VITE_GEE_PYTHON_BACKEND_URL ||
              'http://localhost:5000';
  return url || null;
}

/**
 * Compute real NDVI from Sentinel-2 data via Python GEE backend
 */
export async function computeRealNDVI(
  request: GEENDVIRequest
): Promise<GEENDVIResponse | null> {
  if (!isLocalSatelliteMode()) {
    console.log('[GEE Service] LOCAL_SATELLITE_MODE is false, skipping real NDVI computation');
    return null;
  }

  const backendURL = getGEEBackendURL();
  if (!backendURL) {
    console.warn('[GEE Service] GEE Python backend URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${backendURL}/api/compute-ndvi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.warn(`[GEE Service] Backend returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json() as GEENDVIResponse;
    console.log('[GEE Service] Successfully computed real NDVI');
    return data;
  } catch (error) {
    console.warn('[GEE Service] Failed to compute real NDVI:', error);
    return null;
  }
}

/**
 * Generate GEE tile layer config via Python backend
 */
export async function generateGEETiles(
  request: GEETileRequest
): Promise<GEETileResponse | null> {
  if (!isLocalSatelliteMode()) {
    return null;
  }

  const backendURL = getGEEBackendURL();
  if (!backendURL) {
    return null;
  }

  try {
    const response = await fetch(`${backendURL}/api/generate-tiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as GEETileResponse;
    return data;
  } catch (error) {
    console.warn('[GEE Service] Failed to generate GEE tiles:', error);
    return null;
  }
}
