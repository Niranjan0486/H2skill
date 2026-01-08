/**
 * STEP 3: Monthly Time Window Generator
 * 
 * Generates monthly timestamps from:
 * - Start: January of establishedYear
 * - End: Current year OR fixed demo end (e.g., 2023)
 * 
 * This enables trend analysis over time, not just one-time checks.
 */

import { FactoryInput, TimeWindow } from './types';

/**
 * Generates monthly time windows for analysis
 * @param input - Factory input with establishedYear
 * @param endYear - Optional end year (defaults to current year or fixed demo end)
 * @returns Time window with list of months in "YYYY-MM" format
 */
export function generateTimeWindow(
  input: FactoryInput,
  endYear?: number
): TimeWindow {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Use provided endYear, or current year, or fixed demo end (2023 for hackathon)
  const finalEndYear = endYear || Math.min(currentYear, 2023); // Fixed demo end for MVP

  const startDate = new Date(input.establishedYear, 0, 1); // January 1st
  const endDate = new Date(finalEndYear, 11, 31); // December 31st

  const months: string[] = [];

  // Generate all months from start to end
  let currentYearIter = input.establishedYear;
  let currentMonth = 0; // January

  while (currentYearIter <= finalEndYear) {
    const monthStr = `${currentYearIter}-${String(currentMonth + 1).padStart(2, '0')}`;
    months.push(monthStr);

    // Move to next month
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYearIter++;
    }

    // Stop if we've passed the end date
    if (currentYearIter > finalEndYear) {
      break;
    }
  }

  return {
    startDate,
    endDate,
    months
  };
}

