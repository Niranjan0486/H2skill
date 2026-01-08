import React, { useState } from 'react';
import { Upload, FileText, Loader2, Bell, RefreshCw, MapPin, CheckCircle2, Leaf, Plus, User, TrendingUp } from 'lucide-react';
import { mockAnalyzeReport, analyzeDemoLocation } from '../services/api';
import { AnalysisResult } from '../types';
import ResultsView from './ResultsView';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

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
    try {
      const data = await mockAnalyzeReport(file);
      setResults(data);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartNewAssessment = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleTestDemoLocation = async () => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeDemoLocation();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please check the console for details.");
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

  // Mock data for monthly trends (12 months)
  const monthlyTrends = [
    { month: 'JAN', value: 72 },
    { month: 'FEB', value: 74 },
    { month: 'MAR', value: 75 },
    { month: 'APR', value: 76 },
    { month: 'MAY', value: 78 },
    { month: 'JUN', value: 79 },
    { month: 'JUL', value: 80 },
    { month: 'AUG', value: 81 },
    { month: 'SEP', value: 82 },
    { month: 'OCT', value: 83 },
    { month: 'NOV', value: 85 },
    { month: 'DEC', value: 85 }
  ];

  return (
    <div 
      className="min-h-screen text-white relative bg-cover bg-center" 
      style={{ 
        backgroundImage: "url('https://media.istockphoto.com/id/833383408/photo/old-primeval-forest-with-nice-lights-and-shadows.jpg?s=612x612&w=0&k=20&c=-RCC6BBYz-EI0SiseW5op1CKA4-AJpxvNHqRrkf7Cvg=')"
      }}
    >
      <div className="absolute inset-0 bg-green-950/40" />
      {/* Header */}
      <header className="relative z-10 bg-green-900 border-b border-green-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Factory Assessment Dashboard</h1>
            <p className="text-green-100">Overview of the most recently analyzed factory</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium">
            Last Assessment: Dharwad, Karnataka • Completed
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* New Assessment */}
          <div className="bg-green-900 border border-green-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">New Assessment</h2>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-green-700 bg-green-800/50'
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
                <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-green-200" />
                </div>
                <p className="text-white font-medium mb-1 text-sm">Upload Due Diligence Report PDF, DOCX up to 25MB</p>
              </div>
            </div>
            <button
              onClick={handleStartNewAssessment}
              disabled={isAnalyzing}
              className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Start New Environmental Assessment
            </button>
            <p className="text-green-100 text-xs text-center mt-3">
              Uploading a report will initiate a new analysis and redirect to the Results page.
            </p>
          </div>

          {/* Environmental Risk Status */}
          <div className="bg-green-900 border border-green-700 rounded-xl p-6">
            <h2 className="text-sm font-bold text-green-300 uppercase tracking-wide mb-4">Environmental Risk Status (Historical)</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">COMPLIANT</h3>
              <p className="text-green-100 text-sm text-center mb-4">
                Vegetation levels around the facility remain stable with no significant long-term decline.
              </p>
              <div className="w-full bg-green-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-200 text-sm">Assessment Confidence</span>
                  <span className="text-emerald-400 font-bold">89%</span>
                </div>
                <div className="w-full bg-green-800 rounded-full h-2 mt-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vegetation Index */}
          <div className="bg-green-900 border border-green-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-green-300 uppercase tracking-wide">Vegetation Index (NDVI) – Historical Metric</h2>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">0.72</span>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% vs historical baseline</span>
                </div>
              </div>
              <div className="w-full bg-green-700 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <p className="text-green-100 text-sm italic mb-2">Based on last completed assessment</p>
            <p className="text-green-100 text-sm">Healthy vegetation density surrounding the facility.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Factory Profile */}
          <div className="bg-green-900 border border-green-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Factory Profile</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded">VERIFIED</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">GreenLeaf Textiles Ltd.</h3>
                <div className="flex items-center gap-2 text-green-100 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>Dharwad, Karnataka, India</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded">India Only</span>
                  <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded">Location Verified</span>
                  <span className="bg-slate-600 text-slate-300 text-xs font-medium px-2 py-1 rounded">Historical Assessment</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-700">
                <div>
                  <p className="text-green-200 text-sm mb-1">Industry</p>
                  <p className="text-white font-medium">Textile Mfg.</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-1">Established</p>
                  <p className="text-white font-medium">2005</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-1">Total Land Area</p>
                  <p className="text-white font-medium">4.5 Hectares</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Vegetation Trends */}
          <div className="bg-green-900 border border-green-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Monthly Vegetation Trend Chart</h2>
              <div className="flex items-center gap-2">
                <button className="text-green-200 hover:text-white px-3 py-1 rounded text-sm font-medium">3M</button>
                <button className="text-green-200 hover:text-white px-3 py-1 rounded text-sm font-medium">6M</button>
                <button className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-medium">1Y</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis dataKey="month" tick={{ fill: '#86efac' }} />
                  <YAxis tick={{ fill: '#86efac' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-green-100 text-xs text-center mt-3 italic">
              Seasonal effects normalized using historical vegetation baseline
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
