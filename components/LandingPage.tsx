import React from 'react';
import { UploadCloud, Satellite, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            AI-Powered Environmental
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600"> Compliance Verification</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Verify factory environmental compliance in minutes using Gemini AI, satellite imagery, and automated report analysis.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with satellite data to provide instant compliance verification
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: UploadCloud,
              title: "Upload Report",
              description: "Simply upload your factory audit report (PDF). Our system automatically extracts key data points and factory location."
            },
            {
              icon: BrainCircuit,
              title: "AI Analysis",
              description: "Gemini AI analyzes the report, cross-references satellite imagery, and identifies potential compliance risks."
            },
            {
              icon: Satellite,
              title: "Satellite Verification",
              description: "Real-time satellite data validates environmental claims, tracking vegetation coverage and land use changes."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="bg-emerald-100 p-4 rounded-xl w-fit mb-6">
                <feature.icon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose EcoVerify AI</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Instant Analysis",
            "Satellite Verification",
            "AI-Powered Insights",
            "Compliance Scoring"
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium text-slate-900">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Verify Compliance?</h2>
          <p className="text-emerald-50 mb-8 text-lg max-w-2xl mx-auto">
            Start analyzing factory reports and ensure environmental compliance in minutes.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-emerald-600 hover:bg-slate-50 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;