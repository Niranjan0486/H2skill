import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950">
      {/* Background with tree overlay */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80")',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
        <div className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          AI-Powered Compliance
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Verify Factory Compliance Using
          <br />
          <span className="text-emerald-400">AI & Satellite Evidence</span>
        </h1>
        
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Upload due diligence reports and detect environmental risks instantly using advanced Google AI & real-time satellite data analysis.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.8%</div>
            <div className="text-white/80">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/80">Monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">Zero</div>
            <div className="text-white/80">False Positives</div>
          </div>
        </div>
      </section>

      {/* Streamlined Due Diligence Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Streamlined Due Diligence</h2>
        <p className="text-white/90 text-center max-w-2xl mx-auto mb-12">
          Our AI pipeline automates the verification of environmental compliance in three simple, transparent steps.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Upload Report",
              description: "Upload your factory due diligence report. Our AI extracts key information automatically."
            },
            {
              step: "2",
              title: "AI Analysis",
              description: "Gemini AI analyzes the report and cross-references with satellite imagery for verification."
            },
            {
              step: "3",
              title: "Get Results",
              description: "Receive comprehensive compliance assessment with evidence-based risk analysis."
            }
          ].map((item, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-white/80 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
