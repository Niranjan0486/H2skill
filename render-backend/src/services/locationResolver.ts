export type ResolvedCoordinates = {
  latitude: number;
  longitude: number;
  source: "pdf_coordinates" | "gemini_address" | "user_confirmed";
  displayName?: string;
};

export type LocationConfirmationRequiredError = {
  status: "LOCATION_CONFIRMATION_REQUIRED";
  message: string;
};

function confirmationRequired(message: string): LocationConfirmationRequiredError {
  return { status: "LOCATION_CONFIRMATION_REQUIRED", message };
}

function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lon)
  );
}

/**
 * Deterministically extract latitude/longitude from raw text (NO AI).
 */
export function extractCoordinatesFromText(
  text: string,
): { latitude: number; longitude: number } | null {
  // Pattern 1: "latitude: X, longitude: Y" or "lat: X, lng: Y"
  const pattern1 =
    /(?:latitude|lat)[:\s]+(-?\d+\.?\d*)[,\s]+(?:longitude|lng|lon)[:\s]+(-?\d+\.?\d*)/i;
  const match1 = text.match(pattern1);
  if (match1) {
    const lat = parseFloat(match1[1]);
    const lon = parseFloat(match1[2]);
    if (isValidCoordinate(lat, lon)) return { latitude: lat, longitude: lon };
  }

  // Pattern 2: "X°N, Y°E" or "X°S, Y°W"
  const pattern2 = /(-?\d+\.?\d*)°?\s*([NS])[,\s]+(-?\d+\.?\d*)°?\s*([EW])/i;
  const match2 = text.match(pattern2);
  if (match2) {
    let lat = parseFloat(match2[1]);
    const ns = match2[2].toUpperCase();
    let lon = parseFloat(match2[3]);
    const ew = match2[4].toUpperCase();
    if (ns === "S") lat = -Math.abs(lat);
    if (ew === "W") lon = -Math.abs(lon);
    if (isValidCoordinate(lat, lon)) return { latitude: lat, longitude: lon };
  }

  // Pattern 3: two decimal numbers separated by comma (common)
  const pattern3 = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/g;
  let match3: RegExpExecArray | null;
  while ((match3 = pattern3.exec(text)) !== null) {
    const lat = parseFloat(match3[1]);
    const lon = parseFloat(match3[2]);
    if (isValidCoordinate(lat, lon)) return { latitude: lat, longitude: lon };
  }

  return null;
}

export function buildLocationQueryFromParts(parts: {
  city?: string;
  state?: string;
  country?: string;
}): string | null {
  const city = (parts.city || "").trim();
  const state = (parts.state || "").trim();
  const country = (parts.country || "").trim();

  if (!city || !state) return null;

  return country ? `${city}, ${state}, ${country}` : `${city}, ${state}`;
}

async function geocodeWithNominatim(query: string): Promise<{
  latitude: number;
  longitude: number;
  displayName?: string;
} | null> {
  const nominatimUrl = "https://nominatim.openstreetmap.org/search";
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    addressdetails: "1",
    "accept-language": "en",
  });

  const response = await fetch(`${nominatimUrl}?${params.toString()}`, {
    headers: {
      "User-Agent": "EcoVerify-Demo/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Geocoding API returned ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as Array<any>;
  if (!data || data.length === 0) return null;

  const result = data[0];
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);
  if (!isValidCoordinate(lat, lon)) return null;

  return { latitude: lat, longitude: lon, displayName: result.display_name };
}

// Fallback coordinates for major Indian states (state capitals)
const STATE_FALLBACK_COORDINATES: Record<string, { latitude: number; longitude: number; displayName: string }> = {
  'andhra pradesh': { latitude: 16.5062, longitude: 80.6480, displayName: 'Vijayawada, Andhra Pradesh, India' },
  'ap': { latitude: 16.5062, longitude: 80.6480, displayName: 'Vijayawada, Andhra Pradesh, India' },
  'tamil nadu': { latitude: 13.0827, longitude: 80.2707, displayName: 'Chennai, Tamil Nadu, India' },
  'tn': { latitude: 13.0827, longitude: 80.2707, displayName: 'Chennai, Tamil Nadu, India' },
  'karnataka': { latitude: 12.9716, longitude: 77.5946, displayName: 'Bangalore, Karnataka, India' },
  'ka': { latitude: 12.9716, longitude: 77.5946, displayName: 'Bangalore, Karnataka, India' },
  'telangana': { latitude: 17.3850, longitude: 78.4867, displayName: 'Hyderabad, Telangana, India' },
  'ts': { latitude: 17.3850, longitude: 78.4867, displayName: 'Hyderabad, Telangana, India' },
  'maharashtra': { latitude: 19.0760, longitude: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
  'mh': { latitude: 19.0760, longitude: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
  'gujarat': { latitude: 23.0225, longitude: 72.5714, displayName: 'Ahmedabad, Gujarat, India' },
  'gj': { latitude: 23.0225, longitude: 72.5714, displayName: 'Ahmedabad, Gujarat, India' },
  'west bengal': { latitude: 22.5726, longitude: 88.3639, displayName: 'Kolkata, West Bengal, India' },
  'wb': { latitude: 22.5726, longitude: 88.3639, displayName: 'Kolkata, West Bengal, India' },
  'rajasthan': { latitude: 26.9124, longitude: 75.7873, displayName: 'Jaipur, Rajasthan, India' },
  'rj': { latitude: 26.9124, longitude: 75.7873, displayName: 'Jaipur, Rajasthan, India' },
  'kerala': { latitude: 8.5241, longitude: 76.9366, displayName: 'Thiruvananthapuram, Kerala, India' },
  'kl': { latitude: 8.5241, longitude: 76.9366, displayName: 'Thiruvananthapuram, Kerala, India' },
  'punjab': { latitude: 30.7333, longitude: 76.7794, displayName: 'Chandigarh, Punjab, India' },
  'pb': { latitude: 30.7333, longitude: 76.7794, displayName: 'Chandigarh, Punjab, India' },
};

function getFallbackCoordinates(state?: string): { latitude: number; longitude: number; displayName: string } | null {
  if (!state) return null;
  const stateLower = state.toLowerCase().trim();
  return STATE_FALLBACK_COORDINATES[stateLower] || null;
}

export async function resolveReportCoordinates(input: {
  pdfText: string;
  geminiAddress?: { city?: string; state?: string; country?: string } | null;
  confirmed?: { city?: string; state?: string; country?: string } | null;
}): Promise<ResolvedCoordinates> {
  // 1) Latitude/Longitude in PDF → use directly
  const coords = extractCoordinatesFromText(input.pdfText);
  if (coords) {
    console.log(
      `[Geo] Final coordinates used: ${coords.latitude}, ${coords.longitude}`,
    );
    return { ...coords, source: "pdf_coordinates", displayName: "From PDF" };
  }

  // If user confirmed a location (fallback path), use it.
  const confirmedQuery = input.confirmed
    ? buildLocationQueryFromParts(input.confirmed)
    : null;
  if (confirmedQuery) {
    console.log(`[Geo] Attempting geocoding for confirmed location: ${confirmedQuery}`);
    const geo = await geocodeWithNominatim(confirmedQuery);
    if (geo) {
      console.log(`[Geo] Final coordinates used: ${geo.latitude}, ${geo.longitude}`);
      return { ...geo, source: "user_confirmed" };
    }

    // Geocoding failed - try fallback state coordinates
    console.log('[Geo] Geocoding failed, trying state fallback coordinates...');
    const fallback = getFallbackCoordinates(input.confirmed?.state);
    if (fallback) {
      console.log(`[Geo] Using fallback coordinates for state: ${input.confirmed?.state}`);
      return { ...fallback, source: "user_confirmed" };
    }

    // If even fallback fails, throw error (shouldn't happen for known states)
    throw confirmationRequired(
      "We could not geocode the provided location. Please check the city/state spelling and try again.",
    );
  }

  // 2) Gemini-extracted address → geocode
  const geminiQuery = input.geminiAddress
    ? buildLocationQueryFromParts(input.geminiAddress)
    : null;
  if (geminiQuery) {
    console.log(`[Geo] Attempting geocoding for Gemini address: ${geminiQuery}`);
    const geo = await geocodeWithNominatim(geminiQuery);
    if (geo) {
      console.log(`[Geo] Final coordinates used: ${geo.latitude}, ${geo.longitude}`);
      return { ...geo, source: "gemini_address" };
    }

    // Gemini geocoding failed - try state fallback
    const fallback = getFallbackCoordinates(input.geminiAddress?.state);
    if (fallback) {
      console.log(`[Geo] Using fallback coordinates for Gemini state: ${input.geminiAddress?.state}`);
      return { ...fallback, source: "gemini_address" };
    }
  }

  // 3) Neither exists → STOP and ask user
  throw confirmationRequired(
    "We could not confidently determine the factory location from the report.\nPlease confirm the city/state to proceed with satellite analysis.",
  );
}


