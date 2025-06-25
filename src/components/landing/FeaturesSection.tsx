
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, ArrowRight, Sparkles, Stars } from 'lucide-react';
import { coreFeatures } from './landingData';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Refined background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-16 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-emerald-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-5 h-5 mr-2" />
            <Stars className="w-4 h-4 mr-2 animate-pulse" />
            Powerful Features Built for Kenyan Schools
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-900 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Everything Your School Needs
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            From student enrollment to graduation, EduFam provides comprehensive tools 
            that adapt to your school's unique requirements and Kenya's educational standards.
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-3 border-0 shadow-sm ${
                activeFeature === index 
                  ? 'ring-2 ring-blue-200/50 shadow-lg scale-105 bg-gradient-to-br from-blue-50/50 to-emerald-50/50' 
                  : 'hover:shadow-lg bg-white/80 backdrop-blur-sm'
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-xs text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0 text-emerald-500" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Featured Detail Section */}
        <div className="bg-gradient-to-br from-white/90 via-blue-50/50 to-emerald-50/50 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-emerald-200/20 rounded-full transform translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full transform -translate-x-28 translate-y-28"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${coreFeatures[activeFeature].color} shadow-lg mb-6`}>
                {React.createElement(coreFeatures[activeFeature].icon, { 
                  className: "w-12 h-12 text-white" 
                })}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {coreFeatures[activeFeature].title}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                {coreFeatures[activeFeature].description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coreFeatures[activeFeature].benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-white/30">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
