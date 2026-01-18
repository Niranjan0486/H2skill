/**
 * Main Pipeline Orchestrator
 * 
 * Coordinates all 8 steps of the environmental compliance analysis pipeline:
 * 1. Input Validation
 * 2. AOI Buffer Creation
 * 3. Time Window Generation
 * 4. Satellite Image Fetch
 * 5. NDVI Calculation
 * 6. Trend Analysis
 * 7. Risk Classification
 * 8. Output Formatting
 * 
 * This is the main entry point for the backend pipeline.
 */

import { FactoryInput, PipelineOutput, ValidationResult } from './types';
import { validateInput } from './step1_validation';
import { createAOIBuffer } from './step2_aoi';
import { generateTimeWindow } from './step3_timeWindow';
import { fetchSatelliteDataForTimeWindow } from './step4_satellite';
import { calculateNDVITrend } from './step5_ndvi';
import { analyzeNDVITrend } from './step6_trend';
import { classifyRisk } from './step7_risk';
import { formatPipelineOutput } from './step8_output';

/**
 * Main pipeline function
 * Executes all 8 steps in sequence
 * 
 * @param input - Factory input from frontend
 * @returns Pipeline output with analysis results
 * @throws Error if validation fails
 */
export async function runPipeline(input: FactoryInput): Promise<PipelineOutput> {
  console.log('🚀 Starting environmental compliance analysis pipeline...');
  console.log(`📍 Factory: ${input.factoryName}`);
  console.log(`[NDVI] Using coordinates: ${input.latitude}, ${input.longitude}`);
  console.log(`📍 Location: ${input.latitude}, ${input.longitude}`);

  // STEP 1: Input Validation
  console.log('✓ Step 1: Validating input...');
  const validation: ValidationResult = validateInput(input);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
  }
  console.log('  → Input validation passed');

  // STEP 2: Create AOI Buffer
  console.log('✓ Step 2: Creating Area of Interest buffer...');
  const aoi = createAOIBuffer(input, 2.0); // 2 km radius
  console.log(`  → AOI created: ${aoi.radiusKm} km radius around coordinates`);

  // STEP 3: Generate Time Window
  console.log('✓ Step 3: Generating time window...');
  const timeWindow = generateTimeWindow(input);
  console.log(`  → Time window: ${timeWindow.startDate.toISOString().split('T')[0]} to ${timeWindow.endDate.toISOString().split('T')[0]}`);
  console.log(`  → Total months: ${timeWindow.months.length}`);

  // STEP 4: Fetch Satellite Data
  console.log('✓ Step 4: Fetching satellite imagery...');
  const satelliteData = await fetchSatelliteDataForTimeWindow(aoi, timeWindow, 2);
  const validDataCount = satelliteData.filter(d => d.isValid).length;
  console.log(`  → Fetched ${satelliteData.length} months, ${validDataCount} with valid data (cloud cover < 20%)`);

  // STEP 5: Calculate NDVI
  console.log('✓ Step 5: Calculating NDVI...');
  const ndviData = calculateNDVITrend(satelliteData);
  console.log(`  → Calculated NDVI for ${ndviData.length} months`);
  if (ndviData.length > 0) {
    const firstNDVI = ndviData[0].meanNDVI.toFixed(3);
    const lastNDVI = ndviData[ndviData.length - 1].meanNDVI.toFixed(3);
    console.log(`  → NDVI range: ${firstNDVI} (baseline) to ${lastNDVI} (current)`);
  }

  // STEP 6: Analyze Trend
  console.log('✓ Step 6: Analyzing NDVI trends...');
  const trendAnalysis = analyzeNDVITrend(ndviData);
  console.log(`  → Overall trend: ${trendAnalysis.overallTrend}`);
  console.log(`  → NDVI change: ${trendAnalysis.ndviChange.toFixed(1)}%`);
  console.log(`  → Significant drops: ${trendAnalysis.significantDrops.length}`);

  // STEP 7: Classify Risk
  console.log('✓ Step 7: Classifying deforestation risk...');
  const riskClassification = classifyRisk(trendAnalysis, ndviData);
  console.log(`  → Risk level: ${riskClassification.riskLevel}`);
  console.log(`  → Confidence: ${(riskClassification.confidence * 100).toFixed(0)}%`);

  // STEP 8: Format Output
  console.log('✓ Step 8: Formatting output...');
  const output = formatPipelineOutput(
    input,
    aoi,
    timeWindow,
    ndviData,
    riskClassification
  );

  console.log('✅ Pipeline completed successfully!');
  console.log(`📊 Risk Level: ${output.riskLevel}`);
  
  return output;
}

/**
 * Pipeline error handler
 * Formats errors for frontend consumption
 */
export function handlePipelineError(error: unknown): { error: string; details?: string } {
  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack
    };
  }
  
  return {
    error: 'Unknown error occurred during pipeline execution'
  };
}

