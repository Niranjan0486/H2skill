/**
 * Geocoding Service
 * 
 * Converts text locations to coordinates using OpenStreetMap Nominatim API.
 * No API key required - free and open source.
 * 
 * IMPORTANT: Always appends "India" if country is missing.
 * Fails loudly if geocoding fails (no silent fallback).
 * 
 * Features:
 * - Location string normalization
 * - Retry logic with fallback queries
 * - Structured error responses
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface GeocodeError {
  status: 'LOCATION_UNRESOLVED';
  message: string;
  originalLocation: string;
  attempts: string[];
}

/**
 * Normalize location string
 * 
 * Removes words like "near", "around", "vicinity of" and ensures "India" is appended.
 * 
 * @param textLocation - Raw location text
 * @returns Normalized location string
 */
function normalizeLocationString(textLocation: string): string {
  console.log('[GEO] Raw location text:', textLocation);
  
  let normalized = textLocation.trim();
  
  // Remove common location qualifiers
  const qualifiers = ['near', 'around', 'vicinity of', 'close to', 'adjacent to', 'in the area of'];
  for (const qualifier of qualifiers) {
    const regex = new RegExp(`\\b${qualifier}\\b`, 'gi');
    normalized = normalized.replace(regex, '').trim();
  }
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Always append "India" if missing
  if (!normalized.toLowerCase().includes('india')) {
    normalized = `${normalized}, India`;
  }
  
  console.log('[GEO] Normalized query:', normalized);
  return normalized;
}

/**
 * Extract city and state from location string
 * 
 * @param location - Location string
 * @returns Object with city and state if found
 */
function extractCityAndState(location: string): { city?: string; state?: string } {
  // Common Indian states
  const indianStates = [
    'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Odisha',
    'Telangana', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
    'Assam', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand'
  ];
  
  for (const state of indianStates) {
    const statePattern = new RegExp(`(.+?)[,\\s]+${state.replace(/\s+/g, '\\s+')}`, 'i');
    const match = location.match(statePattern);
    if (match) {
      const city = match[1].trim();
      // Remove "India" if present
      const cleanCity = city.replace(/,\s*India$/i, '').trim();
      return { city: cleanCity, state };
    }
  }
  
  return {};
}

/**
 * Geocode a text location to coordinates with retry logic
 * 
 * @param textLocation - Location text (e.g., "Vijayawada, Andhra Pradesh")
 * @returns Geocoded coordinates
 * @throws GeocodeError if all attempts fail
 */
export async function geocodeLocation(textLocation: string): Promise<GeocodeResult> {
  console.log('[GEO] Starting geocoding for:', textLocation);
  
  // Step 1: Normalize location string
  const normalized = normalizeLocationString(textLocation);
  
  // Step 2: Build retry queries
  const { city, state } = extractCityAndState(normalized);
  const queries: string[] = [
    normalized, // Full normalized query
  ];
  
  // Add fallback queries if city/state extracted
  if (city && state) {
    queries.push(`${city}, ${state}, India`); // City + State + India
    queries.push(`${state}, India`); // State + India only
  }
  
  console.log('[GEO] Geocoding queries to try:', queries);
  
  // Step 3: Try each query with retry logic
  const attempts: string[] = [];
  let lastError: Error | null = null;
  
  for (const query of queries) {
    attempts.push(query);
    console.log('[GEO] Attempting geocoding with query:', query);
    
    try {
      const result = await attemptGeocode(query);
      if (result) {
        console.log('[GEO] Geocoding result:', result.latitude, result.longitude);
        return result;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown geocoding error');
      console.log('[GEO] Geocoding attempt failed for:', query, lastError.message);
      // Continue to next query
    }
    
    // Add delay between attempts to respect rate limits
    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // All attempts failed
  console.error('[GEO] ERROR: All geocoding attempts failed');
  const geocodeError: GeocodeError = {
    status: 'LOCATION_UNRESOLVED',
    message: `Could not resolve factory location from uploaded report. Tried: ${attempts.join('; ')}`,
    originalLocation: textLocation,
    attempts
  };
  
  throw geocodeError;
}

/**
 * Attempt geocoding with a single query
 * 
 * @param query - Location query string
 * @returns GeocodeResult if successful, null if no results
 * @throws Error if API call fails
 */
async function attemptGeocode(query: string): Promise<GeocodeResult | null> {
  // Use OpenStreetMap Nominatim API (free, no API key)
  const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    addressdetails: '1',
    'accept-language': 'en'
  });
  
  // Add delay to respect Nominatim rate limits (1 request per second)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const response = await fetch(`${nominatimUrl}?${params.toString()}`, {
    headers: {
      'User-Agent': 'EcoVerify-AI/1.0' // Required by Nominatim
    }
  });
  
  if (!response.ok) {
    throw new Error(`Geocoding API returned ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data || data.length === 0) {
    return null; // No results, but not an error (will try next query)
  }
  
  const result = data[0];
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Geocoding returned invalid coordinates');
  }
  
  const geocodeResult: GeocodeResult = {
    latitude: lat,
    longitude: lng,
    displayName: result.display_name,
    city: result.address?.city || result.address?.town || result.address?.village,
    state: result.address?.state,
    country: result.address?.country
  };
  
  return geocodeResult;
}

/**
 * Resolve location to coordinates
 * 
 * If location has coordinates, use them directly.
 * If location has text only, geocode it with retry logic.
 * 
 * @param location - Extracted location from PDF
 * @returns Resolved coordinates
 * @throws GeocodeError if resolution fails (structured error)
 */
export async function resolveLocationToCoordinates(
  location: { hasCoordinates: boolean; latitude?: number; longitude?: number; textLocation?: string; city?: string; state?: string }
): Promise<{ latitude: number; longitude: number; displayName?: string }> {
  console.log('[GEO] Resolving location to coordinates...');
  
  if (location.hasCoordinates && location.latitude !== undefined && location.longitude !== undefined) {
    console.log('[GEO] Using coordinates directly from PDF:', location.latitude, location.longitude);
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      displayName: 'From PDF coordinates'
    };
  }
  
  if (location.textLocation) {
    console.log('[GEO] Geocoding text location:', location.textLocation);
    try {
      const geocodeResult = await geocodeLocation(location.textLocation);
      return {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        displayName: geocodeResult.displayName
      };
    } catch (error) {
      // Check if this is a GeocodeError (structured error)
      if (error && typeof error === 'object' && 'status' in error && error.status === 'LOCATION_UNRESOLVED') {
        throw error; // Re-throw structured error
      }
      
      // Wrap other errors in structured format
      const geocodeError: GeocodeError = {
        status: 'LOCATION_UNRESOLVED',
        message: error instanceof Error ? error.message : 'Unknown geocoding error',
        originalLocation: location.textLocation,
        attempts: [location.textLocation]
      };
      throw geocodeError;
    }
  }
  
  // NO FALLBACK - throw structured error
  const geocodeError: GeocodeError = {
    status: 'LOCATION_UNRESOLVED',
    message: 'Cannot resolve location: No coordinates or text location provided',
    originalLocation: 'Unknown',
    attempts: []
  };
  throw geocodeError;
}
