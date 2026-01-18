/**
 * PDF Parser Service
 * 
 * DEPRECATED (demo-safe architecture):
 *
 * The app now uses a 3-layer pipeline on the Node.js backend:
 * 1) Deterministic PDF text extraction (pdf-parse, NO AI)
 * 2) Gemini semantic extraction (ONLY after text exists)
 * 3) Strict location resolution + satellite analysis
 *
 * This legacy module is kept only for reference/debugging and is no longer
 * used by the main PDF analysis flow.
 */

export interface ExtractedLocation {
  hasCoordinates: boolean;
  latitude?: number;
  longitude?: number;
  textLocation?: string; // e.g., "Vijayawada, Andhra Pradesh, India"
  city?: string;
  state?: string;
  country?: string;
}

export interface ExtractedFactoryData {
  factoryName?: string;
  location: ExtractedLocation;
  yearEstablished?: number;
  rawText?: string; // For debugging
}

/**
 * Legacy: Extract location data from a PDF file.
 * NOTE: This module does NOT call Gemini for raw PDF parsing.
 */
export async function extractLocationFromPDF(file: File): Promise<ExtractedFactoryData> {
  console.log('[PDF] Starting location extraction from PDF:', file.name);
  
  // Read PDF as text using backend pdf-parse (REAL extraction)
  const text = await readPDFAsText(file);
  
  // MANDATORY LOG: Raw extracted text (first 1000 chars)
  const textPreview = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
  console.log('[PDF] Raw extracted text:', textPreview);
  console.log('[PDF] Extracted raw text length:', text.length);
  
  // Validate extracted text
  if (!text || text.trim().length < 20) {
    throw new Error('PDF text extraction failed or empty. The PDF might be image-based (scanned document) or encrypted.');
  }
  
  // Try to extract coordinates first (highest priority, but optional)
  const coordinates = extractCoordinates(text);
  if (coordinates) {
    console.log('[PDF] Found coordinates in PDF:', coordinates);
    return {
      location: {
        hasCoordinates: true,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      rawText: text.substring(0, 1000) // First 1000 chars for debugging
    };
  }
  
  // Try to extract text location (flexible - accepts Address, Location, etc.)
  const textLocation = extractTextLocation(text);
  if (textLocation) {
    console.log('[PDF] Detected address line:', textLocation.rawAddress);
    console.log('[PDF] Found text location in PDF:', textLocation);
    return {
      location: {
        hasCoordinates: false,
        textLocation: textLocation.fullText,
        city: textLocation.city,
        state: textLocation.state,
        country: textLocation.country || 'India',
      },
      rawText: text.substring(0, 1000)
    };
  }
  
  // NO FALLBACK - throw error if no location found
  // But provide helpful debugging information
  console.error('[PDF] ERROR: No location found in PDF');
  console.error('[PDF] Extracted text sample (first 1000 chars):', text.substring(0, 1000));
  console.error('[PDF] Full extracted text length:', text.length);
  console.error('[PDF] Searched for keywords:', ['address', 'location', 'situated at', 'near', 'factory location', 'site location']);
  console.error('[PDF] Searched for coordinates patterns');
  
  // Check if text extraction worked at all
  if (text.length < 50) {
    throw new Error('Could not extract sufficient text from PDF. The PDF might be image-based (scanned document) or encrypted. Please ensure the PDF contains selectable text, or provide coordinates (latitude, longitude) in the document.');
  }
  
  // Provide more specific error based on what we found
  const hasLocationKeywords = /address|location|situated|factory|site|plant|facility/i.test(text);
  const hasStateNames = /Andhra Pradesh|Tamil Nadu|Karnataka|Kerala|Maharashtra|Gujarat|Rajasthan|Uttar Pradesh/i.test(text);
  const hasCoordinates = /latitude|longitude|lat|lon|°N|°S|°E|°W/i.test(text);
  
  let errorMessage = 'No valid location found in uploaded PDF. ';
  
  if (hasLocationKeywords) {
    errorMessage += 'Found location keywords but could not parse city/state. ';
  } else if (hasStateNames) {
    errorMessage += 'Found state names but no location keywords (Address, Location, etc.). ';
  } else if (hasCoordinates) {
    errorMessage += 'Found coordinate keywords but could not extract valid coordinates. ';
  } else {
    errorMessage += 'No location keywords, state names, or coordinates found. ';
  }
  
  errorMessage += 'Please ensure the PDF contains either:\n';
  errorMessage += '1. Coordinates: "Latitude: XX, Longitude: YY" or "XX, YY"\n';
  errorMessage += '2. Address with keywords: "Address: City, State" or "Location: City, State"';
  
  throw new Error(errorMessage);
}

/**
 * Read PDF file and extract text content
 * 
 * Uses backend API with pdf-parse for REAL PDF text extraction.
 * This is the proper implementation that actually works.
 */
async function readPDFAsText(file: File): Promise<string> {
  console.log('[PDF] Reading PDF file:', file.name, 'size:', file.size);
  
  try {
    // Send PDF to backend for REAL text extraction using pdf-parse
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    console.log('[PDF] Sending PDF to backend for text extraction...');
    const response = await fetch(`${backendURL}/api/extract-pdf-text`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend returned ${response.status}`);
    }
    
    const result = await response.json();
    const extractedText = result.text || '';
    
    // MANDATORY LOG: Raw extracted text (first 1000 chars)
    console.log('[PDF] Raw extracted text:', extractedText.slice(0, 1000));
    console.log('[PDF] Extracted text length:', extractedText.length);
    console.log('[PDF] Number of pages:', result.numPages);
    
    if (!extractedText || extractedText.trim().length < 20) {
      console.error('[PDF] ERROR: PDF text extraction returned empty or too short text');
      throw new Error('PDF text extraction failed or returned empty text. The PDF might be image-based (scanned document) or encrypted.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('[PDF] ERROR: Failed to extract PDF text:', error);
    if (error instanceof Error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
    throw new Error('PDF text extraction failed: Unknown error');
  }
}

/**
 * Extract coordinates from text using regex patterns
 * 
 * Looks for patterns like:
 * - "latitude: 11.1085, longitude: 77.3411"
 * - "11.1085°N, 77.3411°E"
 * - "11.1085, 77.3411"
 * - "lat: 11.1085, lng: 77.3411"
 */
function extractCoordinates(text: string): { latitude: number; longitude: number } | null {
  // Pattern 1: "latitude: X, longitude: Y" or "lat: X, lng: Y"
  const pattern1 = /(?:latitude|lat)[:\s]+(-?\d+\.?\d*)[,\s]+(?:longitude|lng|lon)[:\s]+(-?\d+\.?\d*)/i;
  const match1 = text.match(pattern1);
  if (match1) {
    const lat = parseFloat(match1[1]);
    const lng = parseFloat(match1[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  // Pattern 2: "X°N, Y°E" or "X°S, Y°W"
  const pattern2 = /(-?\d+\.?\d*)°?[NS][,\s]+(-?\d+\.?\d*)°?[EW]/i;
  const match2 = text.match(pattern2);
  if (match2) {
    let lat = parseFloat(match2[1]);
    let lng = parseFloat(match2[2]);
    // Handle N/S, E/W indicators
    if (text.match(/\d+°?S/i)) lat = -lat;
    if (text.match(/\d+°?W/i)) lng = -lng;
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  // Pattern 3: Two decimal numbers separated by comma (common format)
  const pattern3 = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/g;
  let match3;
  while ((match3 = pattern3.exec(text)) !== null) {
    const lat = parseFloat(match3[1]);
    const lng = parseFloat(match3[2]);
    // Check if these look like valid Indian coordinates
    if (isValidCoordinate(lat, lng) && isLikelyIndianCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  return null;
}

/**
 * Extract text location from PDF text
 * 
 * Accepts multiple keywords (case-insensitive):
 * - Address
 * - Location
 * - Situated at
 * - Near
 * - Factory location
 * - Site location
 * 
 * Parses city & state from free text addresses.
 */
function extractTextLocation(text: string): { fullText: string; city?: string; state?: string; country?: string; rawAddress?: string } | null {
  // Accepted location keywords (case-insensitive)
  const locationKeywords = [
    'address',
    'location',
    'situated at',
    'near',
    'factory location',
    'site location',
    'factory address',
    'plant location',
    'facility location'
  ];
  
  // Pattern 1: Look for any location keyword followed by address text
  // Matches: "Address: Near Rajamahendravaram, Andhra Pradesh, India"
  //          "Location: Vijayawada, Andhra Pradesh"
  //          "Situated at: Tiruppur, Tamil Nadu"
  //          "Address Near Rajamahendravaram" (without colon)
  for (const keyword of locationKeywords) {
    // Escape special regex characters in keyword
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Try pattern with colon first: "Address: ..."
    let pattern = new RegExp(`${escapedKeyword}[:\\s]+([^\\n]{10,200})`, 'i');
    let match = text.match(pattern);
    
    // If no match, try without colon: "Address ..." (keyword followed by space and text)
    if (!match) {
      pattern = new RegExp(`\\b${escapedKeyword}\\s+([A-Za-z][^\\n]{10,200})`, 'i');
      match = text.match(pattern);
    }
    
    // If still no match, try keyword anywhere in line: "Some text Address: ..."
    if (!match) {
      pattern = new RegExp(`[^\\n]*${escapedKeyword}[:\\s]+([^\\n]{10,200})`, 'i');
      match = text.match(pattern);
    }
    
    if (match) {
      const addressLine = match[1].trim();
      console.log('[PDF] Detected address line:', addressLine);
      
      // Parse city and state from the address line
      const parsed = parseCityStateFromAddress(addressLine);
      if (parsed) {
        return {
          fullText: parsed.fullText,
          city: parsed.city,
          state: parsed.state,
          country: parsed.country || 'India',
          rawAddress: addressLine
        };
      }
    }
  }
  
  // Pattern 2: Look for common Indian city-state patterns (fallback)
  // This helps catch locations that don't have explicit keywords
  const indianStates = [
    'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Odisha',
    'Telangana', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
    'Assam', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand'
  ];
  
  for (const state of indianStates) {
    // Look for state name in text, preceded by potential city name
    const statePattern = new RegExp(`([A-Za-z][A-Za-z\\s]{2,30})[,\\s]+${state.replace(/\s+/g, '\\s+')}`, 'i');
    const match = text.match(statePattern);
    if (match) {
      const city = match[1].trim();
      // Remove common prefixes that might have been captured
      const cleanCity = city.replace(/^(near|around|vicinity of|close to)\s+/i, '').trim();
      
      if (cleanCity.length > 2 && cleanCity.length < 50 && !cleanCity.toLowerCase().includes('india')) {
        const parsed = parseCityStateFromAddress(`${cleanCity}, ${state}`);
        if (parsed) {
          return {
            fullText: parsed.fullText,
            city: parsed.city,
            state: parsed.state,
            country: parsed.country || 'India',
            rawAddress: `${cleanCity}, ${state}`
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Parse city and state from free text address
 * 
 * Handles formats like:
 * - "Near Rajamahendravaram, Andhra Pradesh, India"
 * - "Address: Near Rajamahendravaram, Andhra Pradesh, India"
 * - "Vijayawada, Andhra Pradesh"
 * 
 * @param addressText - Raw address text
 * @returns Parsed location with city, state, country
 */
function parseCityStateFromAddress(addressText: string): { fullText: string; city?: string; state?: string; country?: string } | null {
  console.log('[PDF] Parsing address text:', addressText);
  
  // Remove common prefixes
  let cleaned = addressText.trim();
  const prefixes = ['address:', 'location:', 'situated at:', 'near', 'around', 'vicinity of', 'close to', 'factory', 'plant', 'facility'];
  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix}[:\\s]+`, 'i');
    cleaned = cleaned.replace(regex, '').trim();
  }
  
  // Also remove prefixes that might appear in the middle
  for (const prefix of ['near', 'around', 'vicinity of']) {
    const regex = new RegExp(`\\b${prefix}\\s+`, 'gi');
    cleaned = cleaned.replace(regex, ' ').trim();
  }
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Split by commas, but also handle cases where commas might be missing
  let parts = cleaned.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  // If no commas, try splitting by common separators or just use the whole string
  if (parts.length === 1) {
    // Try to split by common words that might separate city and state
    const separators = [' in ', ' of ', ' at '];
    for (const sep of separators) {
      if (cleaned.toLowerCase().includes(sep)) {
        parts = cleaned.split(sep).map(p => p.trim());
        break;
      }
    }
  }
  
  if (parts.length < 1) {
    console.log('[PDF] Address parsing failed: No meaningful parts found');
    return null;
  }
  
  // Identify components
  let city = '';
  let state = '';
  let country = 'India'; // Default to India
  
  // Common Indian states list (expanded)
  const indianStates = [
    'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Odisha',
    'Telangana', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
    'Assam', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand',
    'Goa', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim',
    'Tripura', 'Arunachal Pradesh', 'Delhi', 'Puducherry'
  ];
  
  // Find state in the parts (check each part and also combined parts)
  let stateIndex = -1;
  let foundState = '';
  
  // First, check individual parts
  for (let i = 0; i < parts.length; i++) {
    for (const indianState of indianStates) {
      if (parts[i].toLowerCase() === indianState.toLowerCase() || 
          parts[i].toLowerCase().includes(indianState.toLowerCase())) {
        foundState = indianState;
        stateIndex = i;
        break;
      }
    }
    if (stateIndex !== -1) break;
  }
  
  // If state not found in individual parts, check if it's part of a combined string
  if (stateIndex === -1) {
    const fullTextLower = cleaned.toLowerCase();
    for (const indianState of indianStates) {
      if (fullTextLower.includes(indianState.toLowerCase())) {
        foundState = indianState;
        // Find which part contains the state
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].toLowerCase().includes(indianState.toLowerCase())) {
            stateIndex = i;
            break;
          }
        }
        break;
      }
    }
  }
  
  if (stateIndex === -1) {
    // No state found - try to infer from parts
    if (parts.length >= 2) {
      // Assume first part is city, second is state (even if state not in our list)
      city = parts[0];
      state = parts[1];
      // Check if state looks valid (not too short, not a number)
      if (state.length < 3 || /^\d+$/.test(state)) {
        console.log('[PDF] Address parsing: Second part does not look like a state');
        return null;
      }
    } else if (parts.length === 1) {
      // Only one part - might be just city name, try to extract if it contains state
      const singlePart = parts[0];
      for (const indianState of indianStates) {
        if (singlePart.toLowerCase().includes(indianState.toLowerCase())) {
          // Extract city (everything before state)
          const statePos = singlePart.toLowerCase().indexOf(indianState.toLowerCase());
          city = singlePart.substring(0, statePos).trim();
          state = indianState;
          // Remove common separators from city
          city = city.replace(/\s+(in|of|at)\s+$/i, '').trim();
          break;
        }
      }
      if (!state) {
        // No state found in single part
        console.log('[PDF] Address parsing: Single part, no state found');
        return null;
      }
    } else {
      return null;
    }
  } else {
    // State found
    state = foundState;
    
    // City is everything before state
    if (stateIndex > 0) {
      city = parts.slice(0, stateIndex).join(' ').trim();
    } else if (stateIndex === 0 && parts.length > 1) {
      // State is first part, city might be in the same part before state name
      const statePart = parts[0];
      const statePos = statePart.toLowerCase().indexOf(state.toLowerCase());
      if (statePos > 0) {
        city = statePart.substring(0, statePos).trim();
      } else {
        // State is first, try next part as city (unusual but possible)
        city = parts[1] || '';
      }
    }
    
    // Remove any remaining prefixes from city
    for (const prefix of ['near', 'around', 'vicinity of', 'close to']) {
      const regex = new RegExp(`^${prefix}\\s+`, 'i');
      city = city.replace(regex, '').trim();
    }
    
    // Check if country is specified after state
    if (parts.length > stateIndex + 1) {
      const countryPart = parts[stateIndex + 1].toLowerCase();
      if (countryPart.includes('india')) {
        country = 'India';
      }
    }
  }
  
  // Validate we have meaningful city and state
  if (!city || city.length < 2 || city.length > 50) {
    console.log('[PDF] Address parsing failed: Invalid city:', city);
    return null;
  }
  if (!state || state.length < 2) {
    console.log('[PDF] Address parsing failed: Invalid state:', state);
    return null;
  }
  
  // Construct normalized full text
  const fullText = `${city}, ${state}, ${country}`;
  console.log('[GEO] Normalized location query:', fullText);
  
  return {
    fullText,
    city,
    state,
    country
  };
}

/**
 * Validate coordinate ranges
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
         !isNaN(lat) && !isNaN(lng);
}

/**
 * Check if coordinates are likely in India
 */
function isLikelyIndianCoordinate(lat: number, lng: number): boolean {
  // India bounding box (approximate)
  return lat >= 6.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0;
}
