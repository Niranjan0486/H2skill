import React from 'react';
import { UploadCloud, Satellite, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad)" />
             <defs>
               <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                 <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
               </linearGradient>
             </defs>
           </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">AI-Powered ESG Compliance</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Verify Factory Compliance <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              From Space
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            Automate due diligence by combining extracted report data with real-time satellite imagery analysis to detect environmental risks instantly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              Start Analysis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onGetStarted} // Demo essentially leads to same flow
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Three simple steps to automate your environmental auditing process using Gemini and Satellite data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <UploadCloud className="h-8 w-8 text-blue-600" />,
                title: "1. Upload Report",
                desc: "Upload a PDF due diligence report. Our system parses the document."
              },
              {
                icon: <BrainCircuit className="h-8 w-8 text-purple-600" />,
                title: "2. AI Extraction",
                desc: "Gemini AI extracts key entities: Factory Name, Location, Year, and Capacity."
              },
              {
                icon: <Satellite className="h-8 w-8 text-emerald-600" />,
                title: "3. Satellite Audit",
                desc: "We cross-reference coordinates with historical satellite imagery to detect deforestation."
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-white w-16 h-16 rounded-xl shadow-sm flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Automated Monitoring?</h2>
              <div className="space-y-6">
                {[
                  "Ensure ESG compliance across your supply chain",
                  "Detect illegal deforestation within protected zones",
                  "Monitor changes monthly instead of annual audits",
                  "Reduce cost of physical site inspections by 40%"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl"></div>
              <img 
                src="https://picsum.photos/seed/forest/800/600" 
                alt="Satellite view of forest" 
                className="relative rounded-2xl shadow-2xl border border-slate-700"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4">© 2024 EcoVerify AI. Built for the Hackathon.</p>
          <div className="flex justify-center gap-6 text-sm">
            <span className="hover:text-white cursor-pointer">GitHub</span>
            <span className="hover:text-white cursor-pointer">Documentation</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;