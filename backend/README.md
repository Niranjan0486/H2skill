# Backend Pipeline Documentation

## Overview

This backend implements an AI-powered environmental compliance analysis pipeline that detects vegetation loss around factories using satellite imagery (Sentinel-2). The system analyzes NDVI (Normalized Difference Vegetation Index) trends over time to classify deforestation risk.

**For Hackathon MVP**: The implementation prioritizes clarity, explainability, and scientific correctness over production-scale performance.

---

## Pipeline Architecture

The pipeline consists of 8 sequential steps:

### STEP 1: Input Validation
**File**: `step1_validation.ts`

- Validates factory name, coordinates, and established year
- Ensures coordinates are within India's geographic bounds
- Rejects invalid requests early

**Example**:
```typescript
const validation = validateInput({
  factoryName: "Textile Manufacturing Unit",
  latitude: 11.1085,
  longitude: 77.3411,
  establishedYear: 2017
});
```

---

### STEP 2: Area of Interest (AOI) Buffer Creation
**File**: `step2_aoi.ts`

- Creates a circular buffer of 2 km radius around factory coordinates
- This AOI represents the land influenced by factory activity
- Returns bounding box for satellite imagery queries

**Output**: AOI buffer with center coordinates and bounding box

---

### STEP 3: Monthly Time Window Generator
**File**: `step3_timeWindow.ts`

- Generates monthly timestamps from established year to current/demo end year
- Enables trend analysis over time (not just one-time checks)
- Returns array of months in "YYYY-MM" format

**Example Output**:
```typescript
{
  startDate: Date("2017-01-01"),
  endDate: Date("2023-12-31"),
  months: ["2017-01", "2017-02", ..., "2023-12"]
}
```

---

### STEP 4: Satellite Image Fetch
**File**: `step4_satellite.ts`

- Fetches Sentinel-2 satellite imagery for each month
- Filters cloud cover < 20%
- Retrieves bands:
  - **B4 (Red)**: 665 nm wavelength
  - **B8 (Near Infrared)**: 842 nm wavelength

**MVP Implementation**: 
- Currently uses mock data generation for fast prototyping
- Logic is structured to easily integrate with real APIs:
  - Google Earth Engine
  - Sentinel Hub
  - ESA Copernicus Open Access Hub

---

### STEP 5: NDVI Calculation
**File**: `step5_ndvi.ts`

Calculates Normalized Difference Vegetation Index:

```
NDVI = (NIR - Red) / (NIR + Red)
```

**NDVI Interpretation**:
- `-1 to 0`: Water, clouds, snow
- `0.0 to 0.2`: Barren or sparse vegetation
- `0.2 to 0.5`: Sparse vegetation, shrubs
- `0.5 to 0.8`: Dense vegetation, healthy forest
- `> 0.8`: Very dense vegetation

**Output**: Array of monthly NDVI values

---

### STEP 6: Trend & Threshold Analysis
**File**: `step6_trend.ts`

- Analyzes NDVI trends over time
- Detects:
  - Sustained downward trends (vegetation loss)
  - Sudden NDVI drops (deforestation events)
  - Seasonal fluctuations (ignored)

**Output**: Trend analysis with overall direction and significant drops

---

### STEP 7: Deforestation Risk Classification
**File**: `step7_risk.ts`

Uses explainable rules:

- **HIGH RISK**: NDVI drop > 20% over monitoring period
- **MEDIUM RISK**: NDVI drop between 10-20%
- **LOW RISK**: Otherwise

Also considers:
- Number of significant drops
- Overall trend direction
- Confidence based on data quality

**Output**: Risk level, confidence (0-1), and explainable reason

---

### STEP 8: Evidence Generation
**File**: `step8_output.ts`

- Formats final JSON response for frontend
- Generates:
  - NDVI trend time-series (for graph visualization)
  - Summary text
  - Metadata
  - Disclaimer

---

## Main Pipeline Orchestrator

**File**: `pipeline.ts`

The `runPipeline()` function coordinates all 8 steps:

```typescript
import { runPipeline } from './backend/pipeline';
import type { FactoryInput } from './backend/types';

const input: FactoryInput = {
  factoryName: "Textile Manufacturing Unit",
  latitude: 11.1085,
  longitude: 77.3411,
  establishedYear: 2017
};

const result = await runPipeline(input);
```

---

## Fixed Demo Location

For hackathon demonstrations, the system uses:

**Location**: Tiruppur Textile Industrial Cluster, Tamil Nadu  
**Coordinates**: Latitude 11.1085, Longitude 77.3411  
**Established Year**: 2017 (demo baseline)

This provides consistent, reproducible results for presentations.

---

## Output Format

```typescript
{
  factory: "Textile Manufacturing Unit",
  location: "Tiruppur, Tamil Nadu",
  coordinates: [11.1085, 77.3411],
  ndviTrend: [
    { month: "2017-01", meanNDVI: 0.650 },
    { month: "2017-02", meanNDVI: 0.645 },
    // ...
  ],
  riskLevel: "HIGH" | "MEDIUM" | "LOW",
  confidence: 0.85,
  summary: "Satellite analysis shows...",
  disclaimer: "This system detects vegetation change...",
  metadata: {
    aoiRadiusKm: 2.0,
    timeWindow: "2017 to 2023",
    monthsAnalyzed: 42
  }
}
```

---

## Integration with Frontend

The pipeline output is transformed to match frontend types via `transformPipelineOutputToAnalysisResult()` in `services/api.ts`:

```typescript
import { analyzeFactory } from './services/api';

const result = await analyzeFactory({
  factoryName: "Textile Manufacturing Unit",
  latitude: 11.1085,
  longitude: 77.3411,
  establishedYear: 2017
});
```

---

## Production Considerations

To move from MVP to production:

1. **Satellite Data**: Replace mock implementation in `step4_satellite.ts` with real API calls
2. **Performance**: Implement caching for satellite data
3. **Error Handling**: Add retry logic for API failures
4. **Geospatial Libraries**: Use Turf.js or similar for accurate circular buffers
5. **Validation**: Add more robust coordinate validation (UTM zones, etc.)
6. **Monitoring**: Add logging and metrics collection
7. **Scalability**: Consider queuing for batch processing

---

## Scientific Accuracy

- **NDVI Calculation**: Standard formula used in remote sensing
- **Thresholds**: Based on remote sensing literature (20% drop = significant)
- **Seasonality**: System accounts for natural fluctuations
- **Disclaimer**: System does not assert legal causation, only detects vegetation change

---

## License & Usage

This is a hackathon MVP implementation. The system:
- ✅ Detects vegetation change patterns
- ✅ Provides explainable risk classifications
- ❌ Does NOT assert legal responsibility
- ❌ Does NOT claim causation

Always verify results with ground truthing and regulatory review.

