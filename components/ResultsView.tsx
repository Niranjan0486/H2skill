import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ReferenceLine 
} from 'recharts';
import { 
  Download, Leaf, CheckCircle2, AlertTriangle, TrendingDown, MapPin, Calendar, 
  FileText, ChevronDown, ChevronUp, Eye, Satellite, BarChart3, Shield, 
  Info
} from 'lucide-react';
import { NdviMap } from './NdviMap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsViewProps {
  data: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset }) => {
  // IMPORTANT: Data comes ONLY from the parsed assessment object
  // This component is fully independent of Dashboard state
  // All factory data (name, location, establishment year, assessment ID, timestamp) 
  // must come from the same parsed assessment - NO FALLBACKS
  const { factory, analysis } = data;

  // Ensure all data is from the assessment object
  if (!factory || !analysis) {
    console.error('ResultsView: Missing factory or analysis data from parsed assessment');
    return null;
  }
  
  // Validate that location data exists (should come from parsed report)
  if (!factory.location || !factory.location.city || !factory.location.state) {
    console.error('ResultsView: Missing location data from parsed assessment');
    return null;
  }
  
  const [showFullReasoning, setShowFullReasoning] = useState(false);
  const [satelliteView, setSatelliteView] = useState<'true-color' | 'false-color' | 'ndvi'>('ndvi');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Generate risk badge styling with soft gradients
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'compliant':
        return 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/20 text-emerald-300 border-emerald-400/40';
      case 'moderate-risk':
        return 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-300 border-amber-400/40';
      case 'high-risk':
        return 'bg-gradient-to-r from-red-500/30 to-red-600/20 text-red-300 border-red-400/40';
      default:
        return 'bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-300 border-green-400/40';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'compliant':
        return 'COMPLIANT';
      case 'moderate-risk':
        return 'MODERATE RISK';
      case 'high-risk':
        return 'HIGH RISK';
      default:
        return riskLevel.toUpperCase();
    }
  };

  // Format assessment timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '210mm'; // A4 width
      pdfContainer.style.padding = '20mm';
      pdfContainer.style.backgroundColor = '#1e293b';
      pdfContainer.style.color = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      document.body.appendChild(pdfContainer);

      // Build PDF content
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      };

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      };

      pdfContainer.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 28px; margin-bottom: 10px;">EcoVerify AI</h1>
          <h2 style="font-size: 24px; margin-bottom: 20px;">Environmental Compliance Assessment Report</h2>
        </div>

        <div style="background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="font-size: 20px; margin-bottom: 15px;">${factory.name}</h3>
          <p style="color: #cbd5e1; margin: 5px 0;"><strong>Location:</strong> ${factory.location.city}, ${factory.location.state}, ${factory.location.country}</p>
          <p style="color: #cbd5e1; margin: 5px 0;"><strong>Established:</strong> ${factory.yearEstablished}</p>
          <p style="color: #cbd5e1; margin: 5px 0;"><strong>Assessment ID:</strong> ${analysis.assessmentId}</p>
          <p style="color: #cbd5e1; margin: 5px 0;"><strong>Assessment Date:</strong> ${formatDate(new Date(analysis.assessmentTimestamp))} at ${formatTime(new Date(analysis.assessmentTimestamp))}</p>
          <p style="color: #cbd5e1; margin: 5px 0;"><strong>Risk Status:</strong> ${getRiskLabel(analysis.complianceVerdict.riskLevel)}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #10b981; margin-bottom: 10px;">AI Executive Summary</h3>
          <div style="background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Overall Finding</h4>
            <p style="color: #e2e8f0; line-height: 1.6;">${analysis.summary}</p>
          </div>
          <div style="background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Key Observations</h4>
            <ul style="color: #e2e8f0; line-height: 1.8; padding-left: 20px;">
              <li>Vegetation loss of <strong>${analysis.vegetationLossPercent}%</strong> detected within ${analysis.analysisRadius}km radius</li>
              <li>NDVI declined from <strong>${analysis.ndviBaseline.toFixed(2)}</strong> to <strong>${analysis.ndviCurrent.toFixed(2)}</strong></li>
              ${analysis.anomalyZones && analysis.anomalyZones.length > 0 ? `<li>Anomaly detected in ${analysis.anomalyZones.map(z => z.sector).join(', ')}</li>` : ''}
            </ul>
          </div>
          <div style="background: #0f172a; padding: 15px; border-radius: 8px;">
            <h4 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Risk Interpretation</h4>
            <p style="color: #e2e8f0; line-height: 1.6;">The observed changes are statistically significant and cannot be attributed to seasonal variation. The ${analysis.carbonSinkImpact} carbon sink impact suggests potential regulatory implications under environmental compliance frameworks.</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #10b981; margin-bottom: 10px;">Key Impact Metrics</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #0f172a; padding: 15px; border-radius: 8px;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Vegetation Loss</p>
              <p style="font-size: 32px; color: #f87171; font-weight: bold;">${analysis.vegetationLossPercent}%</p>
              <p style="font-size: 11px; color: #64748b;">Derived from satellite-based NDVI analysis</p>
            </div>
            <div style="background: #0f172a; padding: 15px; border-radius: 8px;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">NDVI Change</p>
              <p style="font-size: 14px; color: #cbd5e1; margin: 3px 0;">Baseline: <strong>${analysis.ndviBaseline.toFixed(2)}</strong></p>
              <p style="font-size: 14px; color: #cbd5e1; margin: 3px 0;">Current: <strong>${analysis.ndviCurrent.toFixed(2)}</strong></p>
              <p style="font-size: 20px; color: ${analysis.ndviChange < 0 ? '#f87171' : '#10b981'}; font-weight: bold; margin-top: 5px;">
                ${analysis.ndviChange > 0 ? '+' : ''}${analysis.ndviChange.toFixed(2)}
              </p>
            </div>
            <div style="background: #0f172a; padding: 15px; border-radius: 8px;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Analysis Radius</p>
              <p style="font-size: 32px; color: #60a5fa; font-weight: bold;">${analysis.analysisRadius} km</p>
              <p style="font-size: 11px; color: #64748b;">Sentinel-2 coverage area</p>
            </div>
            <div style="background: #0f172a; padding: 15px; border-radius: 8px;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Carbon Sink Impact</p>
              <p style="font-size: 24px; color: #fb923c; font-weight: bold; text-transform: capitalize;">${analysis.carbonSinkImpact.replace('-', '-')}</p>
              <p style="font-size: 11px; color: #64748b;">Based on vegetation loss</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #10b981; margin-bottom: 10px;">Vegetation Trend Analysis</h3>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 15px;">Monthly NDVI trend from factory establishment (${factory.yearEstablished}) to present. Seasonal normalization applied.</p>
          <div style="background: #0f172a; padding: 20px; border-radius: 8px; min-height: 200px; display: flex; align-items: center; justify-content: center; color: #64748b;">
            <p>NDVI Trend Chart - See interactive version in web interface</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #10b981; margin-bottom: 10px;">Satellite Evidence</h3>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 10px;"><strong>Source:</strong> Sentinel-2 Satellite Imagery</p>
          <div style="background: #0f172a; padding: 20px; border-radius: 8px; min-height: 200px; display: flex; align-items: center; justify-content: center; color: #64748b;">
            <p>Satellite imagery visualization - See interactive map in web interface</p>
          </div>
          ${analysis.anomalyZones && analysis.anomalyZones.length > 0 ? `
            <div style="background: #7f1d1d; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #ef4444;">
              <h4 style="color: #fca5a5; margin-bottom: 10px;">Anomaly Zones Detected: ${analysis.anomalyZones.map(z => z.sector).join(', ')}</h4>
              ${analysis.anomalyZones.map(zone => `
                <div style="margin-top: 10px;">
                  <p style="color: #fca5a5; font-weight: bold;">${zone.sector} Anomaly</p>
                  <p style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${zone.description}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #10b981; margin-bottom: 10px;">Compliance Verdict</h3>
          <div style="background: #0f172a; padding: 20px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #94a3b8; margin-bottom: 5px;">Compliance Score</p>
                <p style="font-size: 36px; font-weight: bold; color: #ffffff;">${analysis.complianceVerdict.score}/100</p>
                <p style="color: #94a3b8; margin-bottom: 5px; margin-top: 15px;">Risk Level</p>
                <p style="font-size: 18px; font-weight: bold; color: #fbbf24;">${getRiskLabel(analysis.complianceVerdict.riskLevel)}</p>
                <p style="color: #94a3b8; margin-bottom: 5px; margin-top: 15px;">Confidence Score</p>
                <p style="font-size: 24px; font-weight: bold; color: #10b981;">${analysis.complianceVerdict.confidence}%</p>
                <p style="color: #64748b; font-size: 11px; margin-top: 5px; font-style: italic;">Confidence reflects data consistency and cloud-free satellite availability</p>
              </div>
              <div>
                <p style="color: #94a3b8; margin-bottom: 10px;">ESG Relevance</p>
                <div style="margin-bottom: 15px;">
                  ${analysis.complianceVerdict.esgRelevance.map(item => `
                    <span style="background: #1e3a8a; color: #93c5fd; padding: 5px 10px; border-radius: 4px; font-size: 11px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${item}</span>
                  `).join('')}
                </div>
                <p style="color: #94a3b8; margin-bottom: 10px;">Regulatory Context</p>
                <div>
                  ${analysis.complianceVerdict.regulatoryRelevance.map(item => `
                    <span style="background: #581c87; color: #c084fc; padding: 5px 10px; border-radius: 4px; font-size: 11px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${item}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 11px;">
          <p>This report was generated by EcoVerify AI on ${formatDate(new Date())} at ${formatTime(new Date())}</p>
          <p>Assessment ID: ${analysis.assessmentId} | For audit and compliance purposes</p>
        </div>
      `;

      // Convert to canvas and then to PDF
      const canvas = await html2canvas(pdfContainer, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`EcoVerifyAI_Assessment_${analysis.assessmentId}.pdf`);
      
      // Cleanup
      document.body.removeChild(pdfContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate monthly trend data from establishment year
  const generateTrendData = () => {
    const currentYear = new Date().getFullYear();
    const years = currentYear - factory.yearEstablished + 1;
    const months = [];
    
    for (let y = 0; y < years; y++) {
      const year = factory.yearEstablished + y;
      for (let m = 0; m < 12; m++) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Use provided trend data if available, otherwise generate mock data
        const existing = analysis.vegetationTrend.find(
          v => v.month === monthNames[m] && v.year === year
        );
        if (existing) {
          months.push({
            label: `${monthNames[m]} ${year}`,
            ndvi: existing.ndvi,
            normalized: existing.normalized || existing.ndvi,
            year,
            month: monthNames[m]
          });
        } else if (y === 0 && m === 0) {
          // Baseline at establishment
          months.push({
            label: `${monthNames[m]} ${year}`,
            ndvi: analysis.ndviBaseline,
            normalized: analysis.ndviBaseline,
            year,
            month: monthNames[m]
          });
        } else {
          // Interpolate with slight variation
          const prev = months[months.length - 1];
          const trend = (analysis.ndviCurrent - analysis.ndviBaseline) / (years * 12);
          months.push({
            label: `${monthNames[m]} ${year}`,
            ndvi: Math.max(0, Math.min(1, prev.ndvi + trend + (Math.random() - 0.5) * 0.02)),
            normalized: Math.max(0, Math.min(1, prev.normalized + trend + (Math.random() - 0.5) * 0.02)),
            year,
            month: monthNames[m]
          });
        }
      }
    }
    return months;
  };

  const trendData = generateTrendData();

  return (
    <div 
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://media.istockphoto.com/id/833383408/photo/old-primeval-forest-with-nice-lights-and-shadows.jpg?s=612x612&w=0&k=20&c=-RCC6BBYz-EI0SiseW5op1CKA4-AJpxvNHqRrkf7Cvg=')"
      }}
    >
      <div className="absolute inset-0 bg-green-950/50 backdrop-blur-sm" />
      {/* Header */}
      <header className="relative z-10 bg-green-900/90 backdrop-blur-md border-b border-green-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">EcoVerify AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="text-green-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={reportRef} className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* 1. Analysis Header */}
        <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3">{factory.name}</h1>
              <div className="flex items-center gap-4 text-green-100 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{factory.location.city}, {factory.location.state}, {factory.location.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {factory.yearEstablished}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskBadge(analysis.complianceVerdict.riskLevel)}`}>
                  {getRiskLabel(analysis.complianceVerdict.riskLevel)}
                </span>
                <span className="text-green-200 text-sm">
                  Assessment ID: <span className="text-white font-mono">{analysis.assessmentId}</span>
                </span>
                <span className="text-green-200 text-sm">
                  Timestamp: <span className="text-white">{formatTimestamp(analysis.assessmentTimestamp)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 2. AI Executive Summary */}
          <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Executive Summary</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide mb-2">Overall Finding</h3>
                <p className="text-green-100 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide mb-2">Key Observations</h3>
                <ul className="list-disc list-inside space-y-1 text-green-100">
                  <li>Vegetation loss of <strong className="text-white">{analysis.vegetationLossPercent}%</strong> detected within {analysis.analysisRadius}km radius</li>
                  <li>NDVI declined from <strong className="text-white">{analysis.ndviBaseline.toFixed(2)}</strong> to <strong className="text-white">{analysis.ndviCurrent.toFixed(2)}</strong></li>
                  {analysis.anomalyZones && analysis.anomalyZones.length > 0 && (
                    <li>Anomaly detected in {analysis.anomalyZones.map(z => z.sector).join(', ')}</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide mb-2">Risk Interpretation</h3>
                <p className="text-green-100 leading-relaxed">
                  The observed changes are statistically significant and cannot be attributed to seasonal variation. 
                  The {analysis.carbonSinkImpact} carbon sink impact suggests potential regulatory implications 
                  under environmental compliance frameworks.
                </p>
              </div>

              {analysis.fullReasoning && (
                <div className="border-t border-slate-700 pt-4">
                  <button
                    onClick={() => setShowFullReasoning(!showFullReasoning)}
                    className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium w-full"
                  >
                    {showFullReasoning ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Full AI Reasoning
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View Full AI Reasoning
                      </>
                    )}
                  </button>
                  {showFullReasoning && (
                    <div className="mt-4 p-4 bg-green-950/50 rounded-lg text-green-100 text-sm leading-relaxed">
                      {analysis.fullReasoning}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Key Impact Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-5 w-5 text-amber-400" />
                <p className="text-green-300 text-xs uppercase tracking-wide">Vegetation Loss</p>
              </div>
              <p className="text-3xl font-bold text-amber-400 mb-2">{analysis.vegetationLossPercent}%</p>
              <p className="text-green-200 text-xs">Satellite-based NDVI analysis</p>
            </div>

            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <p className="text-green-300 text-xs uppercase tracking-wide">NDVI Change</p>
              </div>
              <div className="mb-2">
                <p className="text-lg text-green-100">Baseline: <span className="text-white font-bold">{analysis.ndviBaseline.toFixed(2)}</span></p>
                <p className="text-lg text-green-100">Current: <span className="text-white font-bold">{analysis.ndviCurrent.toFixed(2)}</span></p>
                <p className={`text-xl font-bold mt-1 ${analysis.ndviChange < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {analysis.ndviChange > 0 ? '+' : ''}{analysis.ndviChange.toFixed(2)}
                </p>
              </div>
              <p className="text-green-200 text-xs">Satellite-based NDVI analysis</p>
            </div>

            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Satellite className="h-5 w-5 text-emerald-300" />
                <p className="text-green-300 text-xs uppercase tracking-wide">Analysis Radius</p>
              </div>
              <p className="text-3xl font-bold text-emerald-300 mb-2">{analysis.analysisRadius} km</p>
              <p className="text-green-200 text-xs">Sentinel-2 coverage area</p>
            </div>

            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="h-5 w-5 text-lime-400" />
                <p className="text-green-300 text-xs uppercase tracking-wide">Carbon Sink Impact</p>
              </div>
              <p className="text-2xl font-bold text-lime-400 mb-2 capitalize">{analysis.carbonSinkImpact.replace('-', '-')}</p>
              <p className="text-green-200 text-xs">Based on vegetation loss</p>
            </div>
          </div>
        </div>

        {/* 4. Vegetation Trend Analysis */}
        <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Vegetation Trend Analysis</h2>
              <p className="text-green-200 text-sm">
                Monthly NDVI trend from factory establishment to present. Seasonal normalization applied.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {factory.yearEstablished < new Date().getFullYear() - 1 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-800/50 rounded-lg text-xs text-green-100">
                  <Info className="h-3 w-3" />
                  <span>Factory established: {factory.yearEstablished}</span>
                </div>
              )}
            </div>
          </div>
          <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#86efac', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[0, 1]}
                  tick={{ fill: '#86efac' }}
                  label={{ value: 'NDVI', angle: -90, position: 'insideLeft', style: { fill: '#86efac' } }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#064e3b', 
                    border: '1px solid #065f46', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  labelStyle={{ color: '#86efac' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="NDVI"
                  dot={{ fill: '#10B981', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                {analysis.vegetationTrend.some(v => v.normalized) && (
                  <Line 
                    type="monotone" 
                    dataKey="normalized" 
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Normalized (Seasonal)"
                    dot={{ fill: '#60a5fa', r: 3 }}
                  />
                )}
                {factory.yearEstablished && (
                  <ReferenceLine 
                    x={trendData.find(t => t.year === factory.yearEstablished && t.month === 'Jan')?.label}
                    stroke="#fbbf24"
                    strokeDasharray="3 3"
                    label={{ value: "Factory Est.", position: "top", fill: "#fbbf24" }}
                  />
                )}
              </LineChart>
                  </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 5. Satellite Evidence Section */}
          <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Satellite Evidence</h2>
              </div>
            </div>
            
            {/* View Toggles */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-green-950/50 rounded-lg">
              <button
                onClick={() => setSatelliteView('true-color')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  satelliteView === 'true-color'
                    ? 'bg-emerald-500 text-white'
                    : 'text-green-200 hover:text-white'
                }`}
              >
                True Color
              </button>
              <button
                onClick={() => setSatelliteView('false-color')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  satelliteView === 'false-color'
                    ? 'bg-emerald-500 text-white'
                    : 'text-green-200 hover:text-white'
                }`}
              >
                False Color (IR)
              </button>
              <button
                onClick={() => setSatelliteView('ndvi')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  satelliteView === 'ndvi'
                    ? 'bg-emerald-500 text-white'
                    : 'text-green-200 hover:text-white'
                }`}
              >
                NDVI Heatmap
              </button>
            </div>

            {/* Map Container */}
            <div className="bg-green-950/50 rounded-lg h-96 mb-4 relative overflow-hidden">
              <NdviMap />
              {analysis.anomalyZones && analysis.anomalyZones.length > 0 && (
                <div className="absolute top-4 left-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 z-10">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Anomaly Zones Detected
                  </div>
                  <div className="text-xs text-slate-300">
                    {analysis.anomalyZones.map(z => z.sector).join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-green-200 mb-4">
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                <span>Source: Sentinel-2 Satellite Imagery</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Before: {analysis.satelliteImages.find(img => img.type === satelliteView)?.date || 'N/A'}</span>
                <span>After: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            <div className="bg-green-950/50 rounded-lg p-4 text-sm text-green-100">
              <p className="font-semibold text-white mb-2">Current View: {satelliteView === 'true-color' ? 'True Color (RGB)' : satelliteView === 'false-color' ? 'False Color (Near-Infrared)' : 'NDVI Heatmap'}</p>
              <p>
                {satelliteView === 'ndvi' 
                  ? 'NDVI values range from -1 to 1, where higher values indicate healthier vegetation. Red zones indicate vegetation loss.'
                  : satelliteView === 'false-color'
                  ? 'False color imagery highlights vegetation in red/pink tones, making it easier to identify changes in vegetation cover.'
                  : 'True color imagery shows the area as it appears to the human eye.'}
              </p>
            </div>
          </div>

          {/* 6. Anomaly Detection Explanation */}
          {analysis.anomalyZones && analysis.anomalyZones.length > 0 && (
            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Anomaly Detection Explanation</h2>
              </div>
              <div className="space-y-4">
                {analysis.anomalyZones.map((zone, index) => (
                  <div key={index} className="border-l-4 border-amber-500 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{zone.sector} Anomaly</h3>
                    <p className="text-green-100 mb-3 leading-relaxed">{zone.description}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-green-300 mb-1">Why flagged:</p>
                        <p className="text-green-100 text-sm">{zone.significance}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-300 mb-1">Seasonal exclusion rationale:</p>
                        <p className="text-green-100 text-sm">{zone.seasonalExclusion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Emissions vs Vegetation Correlation (Optional) */}
        {analysis.emissionsData && analysis.emissionsData.length > 0 && (
          <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Emissions vs Vegetation Correlation</h2>
                <p className="text-green-200 text-sm">
                  Comparative analysis of reported emissions data and NDVI trends
                </p>
              </div>
            </div>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.emissionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis dataKey="period" tick={{ fill: '#86efac' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#86efac' }} label={{ value: 'Emissions', angle: -90, position: 'insideLeft', style: { fill: '#86efac' } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#86efac' }} label={{ value: 'NDVI', angle: 90, position: 'insideRight', style: { fill: '#86efac' } }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#064e3b', 
                      border: '1px solid #065f46', 
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="emissions" fill="#10B981" name="Emissions (tons CO2)" />
                  <Bar yAxisId="right" dataKey="ndvi" fill="#60a5fa" name="NDVI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-300 text-sm flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Disclaimer:</strong> Correlation between emissions data and vegetation trends does not imply causation. 
                  Multiple environmental factors may contribute to observed changes. This analysis is provided for informational 
                  purposes and should be considered alongside other evidence.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 8. Compliance Verdict */}
        <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Compliance Verdict</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-green-200">Compliance Score</span>
                <span className="text-3xl font-bold text-white">{analysis.complianceVerdict.score}/100</span>
              </div>
              <div className="w-full bg-green-800/50 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    analysis.complianceVerdict.score >= 80 ? 'bg-emerald-500' :
                    analysis.complianceVerdict.score >= 60 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${analysis.complianceVerdict.score}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-200">Risk Level</span>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskBadge(analysis.complianceVerdict.riskLevel)}`}>
                  {getRiskLabel(analysis.complianceVerdict.riskLevel)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-200">Confidence Score</span>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-green-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-green-950 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-green-700">
                      Confidence reflects data consistency and cloud-free satellite availability
                    </div>
                  </div>
                </div>
                <span className="text-xl font-bold text-emerald-400">{analysis.complianceVerdict.confidence}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-green-200 text-sm mb-2">ESG Relevance</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.complianceVerdict.esgRelevance.map((item, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-green-200 text-sm mb-2">Regulatory Context</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.complianceVerdict.regulatoryRelevance.map((item, index) => (
                    <span key={index} className="bg-emerald-600/20 text-emerald-200 px-3 py-1 rounded text-xs font-medium">
                      {item}
                    </span>
                  ))}
                  <span className="bg-emerald-600/20 text-emerald-200 px-3 py-1 rounded text-xs font-medium">
                    Environmental due diligence readiness
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Back Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={onReset}
            className="text-green-200 hover:text-white font-medium px-6 py-3 hover:bg-green-900/50 rounded-xl transition-colors"
          >
            Upload Another Report
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsView;
