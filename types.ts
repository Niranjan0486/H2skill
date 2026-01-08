export type ViewState = 'landing' | 'auth' | 'dashboard';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface FactoryData {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  industryType: string;
  yearEstablished: number;
  landArea: string;
  employeeCount: number;
}

export interface ComplianceAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'compliant';
  score: number;
  confidence: number;
  vegetationTrend: { month: string; year: number; ndvi: number; normalized: number }[];
  summary: string;
  fullReasoning?: string;
  vegetationLossPercent: number;
  ndviBaseline: number;
  ndviCurrent: number;
  ndviChange: number;
  analysisRadius: number; // in km
  carbonSinkImpact: 'low' | 'moderate' | 'moderate-high' | 'high';
  anomalyZones?: {
    sector: string;
    description: string;
    significance: string;
    seasonalExclusion: string;
  }[];
  emissionsData?: {
    period: string;
    emissions: number;
    ndvi: number;
  }[];
  complianceVerdict: {
    score: number;
    riskLevel: 'compliant' | 'moderate-risk' | 'high-risk';
    esgRelevance: string[];
    regulatoryRelevance: string[];
    confidence: number;
  };
  recommendedActions: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    description: string;
    targetAudience: 'auditor' | 'regulator' | 'internal';
  }[];
  assessmentId: string;
  assessmentTimestamp: string;
  satelliteImages: {
    id: string;
    date: string;
    url: string;
    description: string;
    type: 'true-color' | 'false-color' | 'ndvi';
  }[];
}

export interface AnalysisResult {
  factory: FactoryData;
  analysis: ComplianceAnalysis;
}