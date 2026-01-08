/**
 * STEP 2: Area of Interest (AOI) Buffer Creation
 * 
 * Creates a circular buffer of 2 km radius around the factory coordinates.
 * This AOI represents the land influenced by factory activity.
 * 
 * For simplicity, we calculate approximate bounding box that encompasses
 * the circular area. In production, use proper geospatial libraries (e.g., Turf.js).
 */

import { FactoryInput, AOIBuffer } from './types';

/**
 * Approximate distance calculations
 * 1 degree latitude ≈ 111 km (constant)
 * 1 degree longitude ≈ 111 km * cos(latitude) (varies with latitude)
 */
const KM_PER_DEGREE_LAT = 111.0;

/**
 * Creates an Area of Interest buffer around factory coordinates
 * @param input - Validated factory input
 * @param radiusKm - Buffer radius in kilometers (default: 2 km)
 * @returns AOI buffer with center and bounding box
 */
export function createAOIBuffer(
  input: FactoryInput,
  radiusKm: number = 2.0
): AOIBuffer {
  const { latitude, longitude } = input;

  // Calculate degrees per kilometer at this latitude
  const kmPerDegreeLng = KM_PER_DEGREE_LAT * Math.cos(latitude * Math.PI / 180);

  // Calculate buffer in degrees
  // For a circular buffer, we use a bounding box that fully contains the circle
  // This is an approximation; production code should use proper circular buffer calculations
  const latBuffer = radiusKm / KM_PER_DEGREE_LAT;
  const lngBuffer = radiusKm / kmPerDegreeLng;

  return {
    center: {
      lat: latitude,
      lng: longitude
    },
    radiusKm,
    bounds: {
      north: latitude + latBuffer,
      south: latitude - latBuffer,
      east: longitude + lngBuffer,
      west: longitude - lngBuffer
    }
  };
}

