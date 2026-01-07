import React from 'react';
import { AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, MapPin, Building2, Calendar, Users, Ruler } from 'lucide-react';

interface ResultsViewProps {
  data: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset }) => {
  const { factory, analysis } = data;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{factory.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{factory.location.city}, {factory.location.country}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getRiskColor(analysis.riskLevel)}`}>
            {analysis.riskLevel === 'high' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            <span className="font-bold uppercase tracking-wide text-sm">
              {analysis.riskLevel} Risk Detected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Industry', val: factory.industryType, icon: Building2 },
            { label: 'Est. Year', val: factory.yearEstablished, icon: Calendar },
            { label: 'Land Area', val: factory.landArea, icon: Ruler },
            { label: 'Employees', val: factory.employeeCount, icon: Users },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              <div className="font-semibold text-slate-900">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Analysis & Chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                 <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900">Gemini Analysis</h3>
            </div>
            <p className="text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
              {analysis.summary}
            </p>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-6">Vegetation Cover Trend (NDVI)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.vegetationTrend}>
                  <defs>
                    <linearGradient id="colorCov" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCov)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Satellite Evidence */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Satellite Evidence</h3>
          <div className="space-y-4">
            {analysis.satelliteImages.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                <img src={img.url} alt={img.description} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{img.date}</span>
                    <span className="text-xs text-slate-400">Sentinel-2</span>
                  </div>
                  <p className="text-sm text-slate-600">{img.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-slate-700 font-medium px-6 py-3 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Upload Another Report
        </button>
      </div>

    </div>
  );
};

export default ResultsView;