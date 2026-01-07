import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { mockAnalyzeReport } from '../services/api';
import { AnalysisResult } from '../types';
import ResultsView from './ResultsView';

const Dashboard: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

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
      // Call mock Gemini API
      const data = await mockAnalyzeReport(file);
      setResults(data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (results) {
    return <ResultsView data={results} onReset={() => setResults(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Due Diligence Analysis</h1>
        <p className="text-slate-500">Upload a factory audit report (PDF) to begin environmental compliance verification.</p>
      </div>

      <div 
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50 bg-white'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          accept=".pdf"
          className="hidden" 
          onChange={handleFileInput}
        />
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-slate-900">Analyzing Report...</h3>
            <p className="text-slate-500 mt-2">Gemini is extracting factory data & cross-referencing satellite imagery.</p>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <div className="bg-emerald-100 p-5 rounded-full mb-6">
              <Upload className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Click to upload or drag and drop
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              PDF files only (max 10MB). System will auto-detect factory location.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-100 py-2 px-4 rounded-lg">
              <FileText className="h-4 w-4" />
              <span>Supported: Standard Audit Reports (SEDEX, SMETA)</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default Dashboard;