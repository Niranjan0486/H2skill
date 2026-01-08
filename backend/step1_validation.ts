/**
 * STEP 1: Input Validation
 * 
 * Validates factory input data:
 * - Latitude & longitude are valid numbers
 * - Coordinates are within India's geographic bounds
 * - Established year is <= current year
 * - Factory name is not empty
 */

import { FactoryInput, ValidationResult } from './types';

/**
 * India's approximate geographic bounds
 * Used to ensure coordinates are within the country
 */
const INDIA_BOUNDS = {
  north: 37.1, // Jammu and Kashmir
  south: 6.5,  // Kanyakumari
  east: 97.4,  // Arunachal Pradesh
  west: 68.1   // Gujarat
};

/**
 * Validates input factory data
 * @param input - Factory input data from frontend
 * @returns Validation result with errors if any
 */
export function validateInput(input: FactoryInput): ValidationResult {
  const errors: string[] = [];

  // Check factory name
  if (!input.factoryName || input.factoryName.trim().length === 0) {
    errors.push('Factory name is required');
  }

  // Check latitude
  if (typeof input.latitude !== 'number' || isNaN(input.latitude)) {
    errors.push('Latitude must be a valid number');
  } else if (input.latitude < -90 || input.latitude > 90) {
    errors.push('Latitude must be between -90 and 90 degrees');
  } else if (input.latitude < INDIA_BOUNDS.south || input.latitude > INDIA_BOUNDS.north) {
    errors.push(`Latitude ${input.latitude} is outside India's bounds (${INDIA_BOUNDS.south} to ${INDIA_BOUNDS.north})`);
  }

  // Check longitude
  if (typeof input.longitude !== 'number' || isNaN(input.longitude)) {
    errors.push('Longitude must be a valid number');
  } else if (input.longitude < -180 || input.longitude > 180) {
    errors.push('Longitude must be between -180 and 180 degrees');
  } else if (input.longitude < INDIA_BOUNDS.west || input.longitude > INDIA_BOUNDS.east) {
    errors.push(`Longitude ${input.longitude} is outside India's bounds (${INDIA_BOUNDS.west} to ${INDIA_BOUNDS.east})`);
  }

  // Check established year
  if (typeof input.establishedYear !== 'number' || isNaN(input.establishedYear)) {
    errors.push('Established year must be a valid number');
  } else {
    const currentYear = new Date().getFullYear();
    if (input.establishedYear > currentYear) {
      errors.push(`Established year ${input.establishedYear} cannot be in the future (current year: ${currentYear})`);
    }
    // Reasonable lower bound (e.g., 1950)
    if (input.establishedYear < 1950) {
      errors.push(`Established year ${input.establishedYear} seems unreasonably old. Please verify.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

