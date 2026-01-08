/**
 * Example Usage of the Backend Pipeline
 * 
 * This file demonstrates how to use the environmental compliance analysis pipeline.
 * Run this with: npx tsx backend/example.ts (or ts-node, etc.)
 */

import { runPipeline, handlePipelineError } from './pipeline';
import type { FactoryInput } from './types';

/**
 * Example 1: Analyze the demo location (Tiruppur, Tamil Nadu)
 */
async function exampleDemoLocation() {
  console.log('\n=== Example 1: Demo Location ===\n');
  
  const demoInput: FactoryInput = {
    factoryName: 'Textile Manufacturing Unit',
    latitude: 11.1085,
    longitude: 77.3411,
    establishedYear: 2017
  };

  try {
    const result = await runPipeline(demoInput);
    console.log('✅ Analysis Complete!');
    console.log(`📍 Location: ${result.location}`);
    console.log(`⚠️  Risk Level: ${result.riskLevel}`);
    console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`\n📈 Summary:\n${result.summary}\n`);
    console.log(`📉 NDVI Trend (sample):`);
    result.ndviTrend.slice(0, 5).forEach(point => {
      console.log(`   ${point.month}: ${point.meanNDVI.toFixed(3)}`);
    });
    console.log(`   ... and ${result.ndviTrend.length - 5} more data points`);
  } catch (error) {
    const errorInfo = handlePipelineError(error);
    console.error('❌ Error:', errorInfo.error);
  }
}

/**
 * Example 2: Custom location
 */
async function exampleCustomLocation() {
  console.log('\n=== Example 2: Custom Location ===\n');
  
  const customInput: FactoryInput = {
    factoryName: 'Custom Factory',
    latitude: 19.0760, // Mumbai
    longitude: 72.8777,
    establishedYear: 2020
  };

  try {
    const result = await runPipeline(customInput);
    console.log('✅ Analysis Complete!');
    console.log(`📍 Location: ${result.location}`);
    console.log(`⚠️  Risk Level: ${result.riskLevel}`);
  } catch (error) {
    const errorInfo = handlePipelineError(error);
    console.error('❌ Error:', errorInfo.error);
  }
}

/**
 * Example 3: Invalid input (should fail validation)
 */
async function exampleInvalidInput() {
  console.log('\n=== Example 3: Invalid Input (Error Handling) ===\n');
  
  const invalidInput: FactoryInput = {
    factoryName: '',
    latitude: 200, // Invalid latitude
    longitude: 77.3411,
    establishedYear: 2030 // Future year
  };

  try {
    const result = await runPipeline(invalidInput);
    console.log('Unexpected success:', result);
  } catch (error) {
    const errorInfo = handlePipelineError(error);
    console.log('✅ Validation correctly caught errors:');
    console.log(`   ${errorInfo.error}`);
  }
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('🚀 Backend Pipeline Examples\n');
  console.log('=' .repeat(50));
  
  await exampleDemoLocation();
  await exampleCustomLocation();
  await exampleInvalidInput();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All examples completed!');
}

export { exampleDemoLocation, exampleCustomLocation, exampleInvalidInput };

// Run examples if this file is executed directly
// Usage: npx tsx backend/example.ts
main().catch(console.error);

