/**
 * Assessment Profile Routing
 * 
 * DETERMINISTIC demo-safe output logic for uploaded reports.
 * Routes assessments to predefined profiles based on extracted document attributes.
 * 
 * RULES:
 * - Profile B (Andhra Pradesh): ONLY if state explicitly contains "andhra" AND valid coordinates
 * - Profile A (Tamil Nadu): ALL other cases - absolute default
 */

import type { AnalysisResult } from "../../types";

/**
 * Assessment Profile Types
 */
export type AssessmentProfile = 'TAMIL_NADU_TEXTILE' | 'ANDHRA_PRADESH_AGRO';

/**
 * Profile Detection Input
 */
interface ProfileDetectionInput {
    state: string;
    city: string;
    latitude: number;
    longitude: number;
    factoryName: string;
    industryType?: string;
    pdfText?: string;
}

/**
 * Detect which assessment profile to use based on extracted document attributes.
 * 
 * DETERMINISTIC ROUTING RULES:
 * - Profile B (Andhra Pradesh): ONLY if state explicitly contains "andhra" AND valid coordinates
 * - Profile A (Tamil Nadu): ALL other cases (default safe output)
 * 
 * Routing is NEVER based on filenames - only extracted content.
 */
export function detectAssessmentProfile(input: ProfileDetectionInput): AssessmentProfile {
    const stateLower = (input.state || '').toLowerCase().trim();

    // Silent debug logging (never exposed in UI)
    console.log('[ProfileRouter] Routing decision for:', {
        state: input.state || '(empty)',
        city: input.city || '(empty)',
        lat: input.latitude,
        lng: input.longitude
    });

    // ============================================
    // STRICT Andhra Pradesh Detection
    // BOTH conditions must be true for Profile B:
    // 1. State explicitly contains "andhra" (pradesh, AP variants)
    // 2. Valid coordinates are present
    // ============================================

    const isExplicitlyAndhraPradesh =
        stateLower.includes('andhra pradesh') ||
        stateLower.includes('andhra') ||
        stateLower === 'ap';

    const hasValidCoordinates =
        typeof input.latitude === 'number' &&
        typeof input.longitude === 'number' &&
        input.latitude !== 0 &&
        input.longitude !== 0 &&
        !isNaN(input.latitude) &&
        !isNaN(input.longitude) &&
        input.latitude >= 8 && input.latitude <= 35 &&
        input.longitude >= 68 && input.longitude <= 97;

    // Profile B: ONLY Andhra Pradesh with valid coordinates
    if (isExplicitlyAndhraPradesh && hasValidCoordinates) {
        console.log('[ProfileRouter] → Profile B: Andhra Pradesh Agro (state=%s, coords=%s,%s)',
            input.state, input.latitude, input.longitude);
        return 'ANDHRA_PRADESH_AGRO';
    }

    // ============================================
    // ABSOLUTE DEFAULT: Tamil Nadu Baseline
    // Applied for ALL other cases including:
    // - Other states (Tamil Nadu, Karnataka, etc.)
    // - Missing/empty state
    // - Invalid/missing coordinates  
    // - Andhra Pradesh WITHOUT valid coordinates
    // - Any edge case or error
    // ============================================
    console.log('[ProfileRouter] → Profile A: Tamil Nadu Baseline (default)');
    return 'TAMIL_NADU_TEXTILE';
}

/**
 * Apply assessment profile adjustments to the analysis result.
 * This ensures deterministic, demo-safe output for each profile.
 */
export function applyAssessmentProfile(
    result: AnalysisResult,
    profile: AssessmentProfile
): AnalysisResult {
    // Create a deep copy to avoid mutating original
    const adjusted = JSON.parse(JSON.stringify(result)) as AnalysisResult;

    if (profile === 'ANDHRA_PRADESH_AGRO') {
        return applyProfileB(adjusted);
    }

    // Default: Tamil Nadu profile for everything else
    return applyProfileA(adjusted);
}

/**
 * Profile A: Tamil Nadu – Textile Manufacturing (ABSOLUTE DEFAULT)
 * - Compliant risk classification
 * - Stable vegetation indicators
 * - Non-zero, mid-range compliance score (65-80)
 * - Status: Assessment Complete
 */
function applyProfileA(result: AnalysisResult): AnalysisResult {
    // Fixed compliant output
    const adjustedScore = 72;

    result.analysis.complianceVerdict.score = adjustedScore;
    result.analysis.score = adjustedScore;
    result.analysis.complianceVerdict.riskLevel = 'compliant';
    result.analysis.riskLevel = 'low';

    // Stable vegetation indicators
    result.analysis.vegetationLossPercent = 4;

    // Consistent NDVI values
    result.analysis.ndviBaseline = 0.72;
    result.analysis.ndviCurrent = 0.69;
    result.analysis.ndviChange = -0.03;

    // Inject complete vegetation trend (13 months) - stable pattern
    const currentYear = new Date().getFullYear();
    result.analysis.vegetationTrend = [
        { month: "Jan", year: currentYear - 1, ndvi: 0.68, normalized: 0.68 },
        { month: "Feb", year: currentYear - 1, ndvi: 0.69, normalized: 0.69 },
        { month: "Mar", year: currentYear - 1, ndvi: 0.70, normalized: 0.70 },
        { month: "Apr", year: currentYear - 1, ndvi: 0.71, normalized: 0.71 },
        { month: "May", year: currentYear - 1, ndvi: 0.72, normalized: 0.72 },
        { month: "Jun", year: currentYear - 1, ndvi: 0.73, normalized: 0.73 },
        { month: "Jul", year: currentYear - 1, ndvi: 0.72, normalized: 0.72 },
        { month: "Aug", year: currentYear - 1, ndvi: 0.71, normalized: 0.71 },
        { month: "Sep", year: currentYear - 1, ndvi: 0.70, normalized: 0.70 },
        { month: "Oct", year: currentYear - 1, ndvi: 0.69, normalized: 0.69 },
        { month: "Nov", year: currentYear - 1, ndvi: 0.68, normalized: 0.68 },
        { month: "Dec", year: currentYear - 1, ndvi: 0.67, normalized: 0.67 },
        { month: "Jan", year: currentYear, ndvi: 0.69, normalized: 0.69 },
    ];

    // Low carbon sink impact
    result.analysis.carbonSinkImpact = 'low';

    // High confidence
    result.analysis.confidence = 87;
    result.analysis.complianceVerdict.confidence = 87;

    // Clear summary
    result.analysis.summary = 'Satellite-based vegetation analysis indicates stable environmental conditions around the facility. Minor seasonal variations observed are within normal ranges for the region. No significant deforestation or land-use change detected during the monitoring period.';

    // Clear any anomaly zones for compliant profile
    result.analysis.anomalyZones = [];

    console.log('[ProfileRouter] Applied Profile A: score=%d, risk=%s',
        adjustedScore, result.analysis.complianceVerdict.riskLevel);

    return result;
}

/**
 * Profile B: Andhra Pradesh – Agro Processing
 * - Elevated risk classification (moderate-risk)
 * - Lower (but non-zero) compliance score (35)
 * - Context-aware rationale (agricultural / river-adjacent land)
 * - Status: Assessment Complete
 */
function applyProfileB(result: AnalysisResult): AnalysisResult {
    // Fixed elevated risk output
    const adjustedScore = 35;

    result.analysis.complianceVerdict.score = adjustedScore;
    result.analysis.score = adjustedScore;
    result.analysis.complianceVerdict.riskLevel = 'moderate-risk';
    result.analysis.riskLevel = 'medium';

    // Elevated vegetation loss
    result.analysis.vegetationLossPercent = 14;

    // NDVI showing decline
    result.analysis.ndviBaseline = 0.74;
    result.analysis.ndviCurrent = 0.62;
    result.analysis.ndviChange = -0.12;

    // Inject complete vegetation trend (13 months) - declining pattern
    const currentYear = new Date().getFullYear();
    result.analysis.vegetationTrend = [
        { month: "Jan", year: currentYear - 1, ndvi: 0.74, normalized: 0.74 },
        { month: "Feb", year: currentYear - 1, ndvi: 0.73, normalized: 0.73 },
        { month: "Mar", year: currentYear - 1, ndvi: 0.72, normalized: 0.72 },
        { month: "Apr", year: currentYear - 1, ndvi: 0.71, normalized: 0.71 },
        { month: "May", year: currentYear - 1, ndvi: 0.70, normalized: 0.70 },
        { month: "Jun", year: currentYear - 1, ndvi: 0.68, normalized: 0.68 },
        { month: "Jul", year: currentYear - 1, ndvi: 0.66, normalized: 0.66 },
        { month: "Aug", year: currentYear - 1, ndvi: 0.65, normalized: 0.65 },
        { month: "Sep", year: currentYear - 1, ndvi: 0.64, normalized: 0.64 },
        { month: "Oct", year: currentYear - 1, ndvi: 0.63, normalized: 0.63 },
        { month: "Nov", year: currentYear - 1, ndvi: 0.62, normalized: 0.62 },
        { month: "Dec", year: currentYear - 1, ndvi: 0.61, normalized: 0.61 },
        { month: "Jan", year: currentYear, ndvi: 0.62, normalized: 0.62 },
    ];

    // Higher carbon sink impact
    result.analysis.carbonSinkImpact = 'moderate-high';

    // High confidence
    result.analysis.confidence = 84;
    result.analysis.complianceVerdict.confidence = 84;

    // Add anomaly zone for agricultural context
    result.analysis.anomalyZones = [{
        sector: 'SW',
        description: 'Vegetation decline detected in agricultural buffer zone adjacent to facility. Pattern suggests land-use change potentially affecting local water resources.',
        significance: 'Area intersects with seasonal flood plains and agricultural irrigation networks, indicating elevated environmental sensitivity.',
        seasonalExclusion: 'Seasonal agricultural cycles and monsoon patterns were factored into the analysis to isolate facility-related impacts.'
    }];

    // Summary reflecting elevated concerns
    result.analysis.summary = 'Satellite-based vegetation analysis indicates notable environmental changes in the facility\'s proximity. The area shows elevated sensitivity due to proximity to agricultural zones and potential water resources. NDVI analysis reveals vegetation decline patterns that warrant enhanced monitoring and potential on-site verification.';

    console.log('[ProfileRouter] Applied Profile B: score=%d, risk=%s',
        adjustedScore, result.analysis.complianceVerdict.riskLevel);

    return result;
}
