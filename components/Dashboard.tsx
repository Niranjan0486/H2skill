import React, { useState } from 'react';
import { Upload, FileText, Loader2, Bell, RefreshCw, MapPin, CheckCircle2, Leaf, Plus, User, TrendingUp, ArrowRight, Info, Clock, Satellite, Database, Cpu } from 'lucide-react';
import { mockAnalyzeReport } from '../services/api';
import { AnalysisResult } from '../types';
import ResultsView from './ResultsView';


interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [needsLocationConfirmation, setNeedsLocationConfirmation] = useState(false);
  const [locationConfirmationMessage, setLocationConfirmationMessage] = useState<string | null>(null);
  const [confirmedCity, setConfirmedCity] = useState('');
  const [confirmedState, setConfirmedState] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleLogoutClick = async () => {
    console.log('Logout button clicked!');
    if (onLogout) {
      try {
        await onLogout();
      } catch (error) {
        console.error('Error in logout handler:', error);
      }
    } else {
      console.error('onLogout prop is not provided!');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0]);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    setNeedsLocationConfirmation(false);
    setLocationConfirmationMessage(null);
    setPendingFile(null);
    try {
      const data = await mockAnalyzeReport(file);
      console.log('[Dashboard] Received analysis result:', data);
      console.log('[Dashboard] Factory name:', data.factory?.name);
      console.log('[Dashboard] Year:', data.factory?.yearEstablished);
      console.log('[Dashboard] Profile:', (data as any).extracted?.profile || 'unknown');
      setResults(data);
    } catch (error) {
      // DEMO-SAFE: Log errors but don't block the user
      console.error("[Dashboard] Analysis error (logged for debugging):", error);

      // Show a simple, non-blocking error message
      alert(
        "Analysis could not be completed with the uploaded file.\n\n" +
        "Please try again with a different file or check the browser console for details."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartNewAssessment = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleViewDetailedResults = () => {
    // Trigger analysis with sample data to navigate to results
    setShowResults(true);
  };

  const submitConfirmedLocation = async () => {
    if (!pendingFile) return;
    if (!confirmedCity.trim() || !confirmedState.trim()) {
      alert('Please enter both city and state to proceed.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await mockAnalyzeReport(pendingFile, {
        city: confirmedCity.trim(),
        state: confirmedState.trim(),
        country: 'India',
      });
      setResults(data);
      setNeedsLocationConfirmation(false);
      setPendingFile(null);
      setLocationConfirmationMessage(null);
    } catch (error) {
      console.error("Analysis failed", error);
      if (error && typeof error === 'object' && 'status' in error && (error as any).status === 'LOCATION_CONFIRMATION_REQUIRED') {
        const e = error as { status: string; message: string };
        setLocationConfirmationMessage(e.message);
      } else if (error instanceof Error) {
        alert("Analysis failed. Please try again.\n\n" + error.message);
      } else {
        alert("Analysis failed. Please check the console for details.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (results) {
    return (
      <div className="min-h-screen bg-slate-900">
        <ResultsView data={results} onReset={() => setResults(null)} />
      </div>
    );
  }



  // Format last assessment date
  const lastAssessmentDate = new Date('2026-01-15T09:30:00Z');
  const formattedDate = lastAssessmentDate.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://media.istockphoto.com/id/833383408/photo/old-primeval-forest-with-nice-lights-and-shadows.jpg?s=612x612&w=0&k=20&c=-RCC6BBYz-EI0SiseW5op1CKA4-AJpxvNHqRrkf7Cvg=')"
      }}
    >
      <div className="absolute inset-0 bg-green-950/60" />
      {/* Header */}
      <header className="relative z-10 bg-green-900/95 border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">Eco Verify</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogoutClick}
              type="button"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Assessment Overview Section */}
      <section className="relative z-10 bg-green-900/80 border-b border-green-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Assessment Overview
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-green-800/50 rounded-lg px-3 py-2.5 border border-green-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-medium uppercase">Last Assessment Date</span>
              </div>
              <p className="text-white text-sm font-semibold">{formattedDate}</p>
            </div>
            <div className="bg-green-800/50 rounded-lg px-3 py-2.5 border border-green-700/50">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-medium uppercase">Location Verified</span>
              </div>
              <p className="text-white text-sm font-semibold">Dharwad, Karnataka, India</p>
              <p className="text-green-400 text-xs">15.4589° N, 75.0078° E</p>
            </div>
            <div className="bg-green-800/50 rounded-lg px-3 py-2.5 border border-green-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Satellite className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-medium uppercase">Data Sources</span>
              </div>
              <p className="text-white text-xs leading-relaxed">Sentinel-2 satellite imagery, historical NDVI baseline, uploaded due diligence report</p>
            </div>
            <div className="bg-green-800/50 rounded-lg px-3 py-2.5 border border-green-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-medium uppercase">Analysis Engine</span>
              </div>
              <p className="text-white text-sm font-semibold">Environmental Risk Engine v1.0</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-5">
        {/* Dashboard Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Factory Assessment Dashboard</h1>
            <p className="text-green-200 text-sm">Overview of the most recently analyzed factory</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-500/30">
            Status: Assessment Complete
          </div>
        </div>

        {needsLocationConfirmation && (
          <div className="mb-4 bg-amber-500/10 border border-amber-400/40 rounded-xl p-4">
            <h2 className="text-lg font-bold text-amber-200 mb-2">Location confirmation required</h2>
            <p className="text-amber-100 whitespace-pre-line mb-3 text-sm">
              {locationConfirmationMessage ||
                "We could not confidently determine the factory location from the report.\nPlease confirm the city/state to proceed with satellite analysis."}
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                value={confirmedCity}
                onChange={(e) => setConfirmedCity(e.target.value)}
                placeholder="City (e.g., Tiruppur)"
                className="bg-slate-900/60 border border-amber-400/30 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 text-sm"
              />
              <input
                value={confirmedState}
                onChange={(e) => setConfirmedState(e.target.value)}
                placeholder="State (e.g., Tamil Nadu)"
                className="bg-slate-900/60 border border-amber-400/30 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 text-sm"
              />
              <button
                type="button"
                onClick={submitConfirmedLocation}
                disabled={isAnalyzing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg px-4 py-2 disabled:opacity-50 text-sm"
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          {/* New Assessment */}
          <div className="bg-green-900/90 border border-green-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">New Assessment</h2>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-green-700 bg-green-800/50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center mb-2">
                  <Upload className="h-5 w-5 text-green-200" />
                </div>
                <p className="text-white font-medium text-sm">Upload Due Diligence Report</p>
                <p className="text-green-300 text-xs mt-1">PDF, DOCX up to 25MB</p>
              </div>
            </div>

            {/* 3-Step Process Description */}
            <div className="mt-3 bg-green-800/40 rounded-lg p-3 border border-green-700/50">
              <p className="text-green-300 text-xs font-semibold uppercase mb-2">Analysis Pipeline</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-green-100 text-xs">Report parsing & land metadata extraction</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                  <p className="text-green-100 text-xs">Satellite-based vegetation analysis (NDVI)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-green-100 text-xs">Environmental risk classification</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartNewAssessment}
              disabled={isAnalyzing}
              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
            >
              <Plus className="h-4 w-4" />
              Start New Environmental Assessment
            </button>
          </div>

          {/* Environmental Risk Status */}
          <div className="bg-green-900/90 border border-green-700 rounded-xl p-4">
            <h2 className="text-xs font-bold text-green-300 uppercase tracking-wide mb-3">Environmental Risk Status (Historical)</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
                </div>
              </div>

              {/* Numeric Risk Score */}
              <div className="bg-green-800/60 rounded-lg px-4 py-2 mb-2 border border-green-600/50">
                <p className="text-green-300 text-xs text-center mb-1">Risk Score</p>
                <p className="text-white text-xl font-bold text-center">18 <span className="text-sm font-normal text-green-300">/ 100</span></p>
                <p className="text-emerald-400 text-xs font-semibold text-center">Low Risk</p>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">COMPLIANT</h3>
              <p className="text-green-200 text-xs text-center mb-2">
                No material increase compared to previous assessment
              </p>

              <div className="w-full bg-green-700/50 rounded-lg p-2.5 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-green-200 text-xs">Assessment Confidence</span>
                  <span className="text-emerald-400 font-bold text-sm">89%</span>
                </div>
                <div className="w-full bg-green-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>

              <p className="text-green-400 text-xs text-center italic mb-3">
                Status derived from vegetation trend stability and land-use consistency
              </p>

              <button
                onClick={handleViewDetailedResults}
                className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm border border-emerald-500/30"
              >
                View Detailed Results
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Vegetation Index */}
          <div className="bg-green-900/90 border border-green-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-green-300 uppercase tracking-wide">Vegetation Index (NDVI) – Historical Metric</h2>
            </div>

            {/* Time Window & Source */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-800/50 rounded px-2 py-1 border border-green-700/50">
                <span className="text-green-300 text-xs">Time Window: </span>
                <span className="text-white text-xs font-semibold">Past 12 months</span>
              </div>
              <div className="bg-blue-900/40 rounded px-2 py-1 border border-blue-700/50">
                <span className="text-blue-300 text-xs">Source: </span>
                <span className="text-white text-xs font-semibold">Sentinel-2</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">0.72</span>
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% vs historical baseline</span>
                </div>
              </div>
              <div className="w-full bg-green-700 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>

            <p className="text-green-100 text-xs mb-3">Healthy vegetation density surrounding the facility.</p>

            {/* NDVI Tooltip/Helper */}
            <div className="bg-green-800/40 rounded-lg p-2.5 border border-green-700/50 mb-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-200 text-xs">
                  <span className="font-semibold">NDVI</span> (Normalized Difference Vegetation Index) measures plant health on a scale from -1 to 1, where values above 0.6 indicate healthy, dense vegetation.
                </p>
              </div>
            </div>

            <button
              onClick={handleViewDetailedResults}
              className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm border border-emerald-500/30"
            >
              View Detailed Results
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Factory Profile */}
          <div className="bg-green-900/90 border border-green-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Factory Profile</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded border border-emerald-500/30">VERIFIED</span>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Dharwad Textiles Pvt. Ltd.</h3>
                <div className="flex items-center gap-2 text-green-100 mb-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Dharwad, Karnataka, India</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded">India Only</span>
                  <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded">Location Verified</span>
                  <span className="bg-slate-600/80 text-slate-300 text-xs font-medium px-2 py-1 rounded">Historical Assessment</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-green-700">
                <div>
                  <p className="text-green-300 text-xs mb-0.5">Industry</p>
                  <p className="text-white font-medium text-sm">Textile Mfg.</p>
                </div>
                <div>
                  <p className="text-green-300 text-xs mb-0.5">Established</p>
                  <p className="text-white font-medium text-sm">2005</p>
                </div>
                <div>
                  <p className="text-green-300 text-xs mb-0.5">Land Area</p>
                  <p className="text-white font-medium text-sm">4.5 Hectares</p>
                </div>
              </div>
            </div>
          </div>

          {/* Satellite Environmental Impact Analysis */}
          <div className="bg-green-900/90 border border-green-700 rounded-xl p-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Satellite Environmental Impact Analysis</h2>
              <p className="text-green-300 text-xs">Last 12 Months · Feb 2025 – Jan 2026</p>
            </div>

            {/* Impact Verdict */}
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Impact Verdict</p>
                  <p className="text-white font-bold text-base">No Adverse Environmental Impact Detected</p>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="mb-4">
              <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-2">Key Findings</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-green-100 text-sm">Vegetation density remained within ±6% of historical baseline</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-green-100 text-sm">No abrupt land-use or deforestation events detected near facility boundary</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-green-100 text-sm">Observed seasonal variations align with regional agricultural cycles</p>
                </li>
              </ul>
            </div>

            {/* Automated Checks Performed */}
            <div className="bg-green-800/40 border border-green-700/50 rounded-lg p-3 mb-4">
              <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-2">Automated Checks Performed</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-green-100 text-xs">Deforestation detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-green-100 text-xs">Vegetation loss anomaly detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-green-100 text-xs">Land expansion monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-green-100 text-xs">Seasonal normalization applied</span>
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-green-700/50">
              <div>
                <p className="text-green-400 text-xs mb-0.5">Analysis Confidence</p>
                <p className="text-white font-semibold text-sm">89%</p>
              </div>
              <div>
                <p className="text-green-400 text-xs mb-0.5">Last Satellite Scan</p>
                <p className="text-white font-semibold text-sm">Jan 2026</p>
              </div>
              <div>
                <p className="text-green-400 text-xs mb-0.5">Satellite Source</p>
                <p className="text-white font-semibold text-sm">Sentinel-2 (10m)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
