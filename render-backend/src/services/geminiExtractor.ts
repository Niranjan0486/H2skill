import { GoogleGenerativeAI } from "@google/generative-ai";

export type GeminiFactoryDetails = {
  factory_name?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  establishment_year?: number | string;
};

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GoogleGenerativeAI(key) : null;
}

/**
 * Simple text parser fallback - extracts factory details using regex patterns
 * Used when Gemini fails or is unavailable
 */
function extractWithTextParser(text: string): GeminiFactoryDetails | null {
  console.log("[TextParser] Attempting simple text extraction as fallback...");

  const result: GeminiFactoryDetails = {};

  // Extract factory name - look for "Factory Name:" pattern
  const nameMatch = text.match(/Factory\s+Name\s*:\s*([^\n]+)/i);
  if (nameMatch) {
    result.factory_name = nameMatch[1].trim();
    console.log("[TextParser] ✅ Found factory name:", result.factory_name);
  }

  // Extract establishment year - look for "Establishment Year:" pattern
  const yearMatch = text.match(/Establishment\s+Year\s*:\s*(\d{4})/i);
  if (yearMatch) {
    result.establishment_year = parseInt(yearMatch[1], 10);
    console.log("[TextParser] ✅ Found establishment year:", result.establishment_year);
  }

  // Extract address components
  const address: { city?: string; state?: string; country?: string } = {};

  // Look for "Address:" pattern
  const addressMatch = text.match(/Address\s*:\s*([^\n]+)/i);
  if (addressMatch) {
    const addressText = addressMatch[1];
    // Split by comma to get city, state, country
    const parts = addressText.split(',').map(p => p.trim());
    if (parts.length >= 1) address.city = parts[0];
    if (parts.length >= 2) address.state = parts[1];
    if (parts.length >= 3) address.country = parts[2];
    console.log("[TextParser] ✅ Found address:", address);
  }

  if (Object.keys(address).length > 0) {
    result.address = address;
  }

  // Only return if we found at least factory name or year
  if (result.factory_name || result.establishment_year) {
    console.log("[TextParser] ✅ Successfully extracted data using text parser");
    return result;
  }

  console.log("[TextParser] ❌ Could not extract factory details from text");
  return null;
}

/**
 * Gemini AI – semantic extraction ONLY.
 * Must be called ONLY after deterministic PDF text extraction succeeds.
 * Falls back to simple text parser if Gemini fails.
 */
export async function extractFactoryDetailsWithGemini(
  text: string,
): Promise<GeminiFactoryDetails | null> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn("[Gemini] API key missing – using text parser fallback");
    return extractWithTextParser(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = `
Extract the following fields from this compliance report.
Return ONLY valid JSON.

Fields:
- factory_name
- address (city, state, country)
- establishment_year

Text:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("[Gemini] Raw response:", response);

    try {
      const parsed = JSON.parse(response) as GeminiFactoryDetails;
      console.log("[Gemini] ✅ Successfully parsed JSON:");
      console.log("[Gemini]   - factory_name:", parsed.factory_name);
      console.log("[Gemini]   - establishment_year:", parsed.establishment_year);
      console.log("[Gemini]   - address:", parsed.address);
      return parsed;
    } catch {
      console.warn("[Gemini] ❌ Returned invalid JSON, using text parser fallback");
      return extractWithTextParser(text);
    }
  } catch (err) {
    console.warn("[Gemini] ❌ Extraction failed, using text parser fallback:", err instanceof Error ? err.message : String(err));
    return extractWithTextParser(text);
  }
}

