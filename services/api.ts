import { AnalysisResult } from '../types';

/**
 * GEMINI API INTEGRATION NOTES:
 * 
 * In a production environment, this function would:
 * 1. Receive the file Blob from the frontend.
 * 2. Convert PDF/Image to a format compatible with Gemini (e.g., base64 or storage URI).
 * 3. Call `ai.models.generateContent` with a prompt like:
 *    "Extract factory name, location, establishment year, and capacity from this due diligence report. Return as JSON."
 * 
 * Example Gemini Code:
 * const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
 * const result = await ai.models.generateContent({
 *   model: 'gemini-2.5-flash-latest',
 *   contents: [
 *     { inlineData: { mimeType: file.type, data: base64Data } },
 *     { text: "Extract structured factory data..." }
 *   ]
 * });
 */

export const mockAnalyzeReport = async (file: File): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    // Simulate network delay for AI processing
    setTimeout(() => {
      resolve({
        factory: {
          id: 'fac_12345',
          name: 'GreenTech Textiles Ltd.',
          location: {
            city: 'Bandung',
            state: 'West Java',
            country: 'Indonesia',
            lat: -6.9175,
            lng: 107.6191
          },
          industryType: 'Textile Manufacturing',
          yearEstablished: 2018,
          landArea: '12.5 Hectares',
          employeeCount: 450
        },
        analysis: {
          riskLevel: 'medium',
          score: 65,
          summary: "Satellite imagery indicates a 12% reduction in vegetation cover since factory establishment (2018). While consistent with initial construction, recent expansion in Q3 2023 shows potential encroachment on protected buffer zones.",
          vegetationTrend: [
            { month: 'Jan', coverage: 85 },
            { month: 'Feb', coverage: 84 },
            { month: 'Mar', coverage: 82 },
            { month: 'Apr', coverage: 78 },
            { month: 'May', coverage: 75 },
            { month: 'Jun', coverage: 72 },
            { month: 'Jul', coverage: 70 },
            { month: 'Aug', coverage: 68 },
            { month: 'Sep', coverage: 68 },
            { month: 'Oct', coverage: 69 },
            { month: 'Nov', coverage: 71 },
            { month: 'Dec', coverage: 72 },
          ],
          satelliteImages: [
            {
              id: 'sat_1',
              date: '2018 (Baseline)',
              url: 'https://picsum.photos/seed/forest1/400/300',
              description: 'Pre-construction baseline showing dense vegetation.'
            },
            {
              id: 'sat_2',
              date: '2021 (Operational)',
              url: 'https://picsum.photos/seed/factory1/400/300',
              description: 'Factory fully operational. Buffer zones intact.'
            },
            {
              id: 'sat_3',
              date: '2024 (Current)',
              url: 'https://picsum.photos/seed/deforest/400/300',
              description: 'Recent expansion detected in northern sector.'
            }
          ]
        }
      });
    }, 2500); // 2.5s simulated delay
  });
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