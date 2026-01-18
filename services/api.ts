import { AnalysisResult } from '../types';
import type { FactoryInput } from '../backend/types';
import { auth } from './firebase';

/**
 * Backend Pipeline Integration
 * 
 * This function uses the environmental compliance analysis pipeline
 * to analyze factory locations using satellite imagery (Sentinel-2).
 * 
 * The pipeline:
 * 1. Validates input
 * 2. Creates Area of Interest (2 km buffer)
 * 3. Generates monthly time windows
 * 4. Fetches satellite imagery
 * 5. Calculates NDVI (vegetation index)
 * 6. Analyzes trends
 * 7. Classifies deforestation risk
 * 8. Generates evidence and summary
 */

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'https://ecoverify-backend.onrender.com';

/**
 * Analyzes factory data by calling the protected Render backend.
 * Backend runs the existing pipeline and returns AnalysisResult.
 */
export async function analyzeFactory(factoryInput: FactoryInput): Promise<AnalysisResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${BACKEND_BASE_URL}/api/analyze-factory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(factoryInput),
  });

  if (!response.ok) {
    let message = 'Backend error';
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data as AnalysisResult;
}

/**
 * Analyze an uploaded compliance report PDF end-to-end via the backend:
 * - Deterministic PDF text extraction (pdf-parse)
 * - Gemini semantic extraction (optional; backend-only)
 * - Strict location resolution + satellite analysis
 */
export type LocationConfirmationRequired = {
  status: 'LOCATION_CONFIRMATION_REQUIRED';
  message: string;
};

export const mockAnalyzeReport = async (
  file: File,
  confirmedLocation?: { city: string; state: string; country?: string }
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('pdf', file);

  if (confirmedLocation) {
    formData.append('city', confirmedLocation.city);
    formData.append('state', confirmedLocation.state);
    if (confirmedLocation.country) formData.append('country', confirmedLocation.country);
  }

  const response = await fetch(`${BACKEND_BASE_URL}/api/analyze-report`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (data && typeof data === 'object' && 'status' in data && data.status === 'LOCATION_CONFIRMATION_REQUIRED') {
      throw data as LocationConfirmationRequired;
    }
    const msg =
      data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string'
        ? (data as any).error
        : `Backend returned ${response.status}`;
    throw new Error(msg);
  }

  const analysisResult = (data as any).analysis as AnalysisResult;

  // Log the actual data received from backend
  console.log('[API] Backend response:', data);
  console.log('[API] Extracted analysis:', analysisResult);
  console.log('[API] Factory name:', analysisResult.factory?.name);
  console.log('[API] Year established:', analysisResult.factory?.yearEstablished);
  console.log('[API] Confidence:', analysisResult.analysis?.complianceVerdict?.confidence);

  return analysisResult;
};

export const mockAuth = async (email: string): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'usr_99',
        name: 'Sustainability Officer',
        email: email,
        avatar: 'https://picsum.photos/seed/user/100/100'
      });
    }, 1000);
  });
};