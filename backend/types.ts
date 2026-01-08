/**
 * Backend Pipeline Types
 * Type definitions for the environmental compliance analysis pipeline
 */

export interface FactoryInput {
  factoryName: string;
  latitude: number;
  longitude: number;
  establishedYear: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AOIBuffer {
  center: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
  // For circular buffer calculations
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface TimeWindow {
  startDate: Date;
  endDate: Date;
  months: string[]; // Format: "YYYY-MM"
}

export interface SatelliteImageData {
  month: string; // "YYYY-MM"
  red: number; // B4 band mean value
  nir: number; // B8 band mean value
  cloudCover: number; // 0-100
  isValid: boolean;
}

export interface NDVIData {
  month: string; // "YYYY-MM"
  meanNDVI: number; // Range: -1 to 1
}

export interface TrendAnalysis {
  overallTrend: 'increasing' | 'decreasing' | 'stable';
  ndviChange: number; // Percentage change
  significantDrops: Array<{
    month: string;
    drop: number; // Percentage
  }>;
}

export interface RiskClassification {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0.0 to 1.0
  reason: string;
}

export interface PipelineOutput {
  factory: string;
  location: string;
  coordinates: [number, number];
  ndviTrend: NDVIData[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  summary: string;
  disclaimer: string;
  metadata: {
    aoiRadiusKm: number;
    timeWindow: string;
    monthsAnalyzed: number;
  };
}

