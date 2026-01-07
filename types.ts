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
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  vegetationTrend: { month: string; coverage: number }[];
  summary: string;
  satelliteImages: {
    id: string;
    date: string;
    url: string;
    description: string;
  }[];
}

export interface AnalysisResult {
  factory: FactoryData;
  analysis: ComplianceAnalysis;
}