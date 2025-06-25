
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, ArrowRight, Sparkles } from 'lucide-react';
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
    <section id="features" className="py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-100 rounded-full opacity-15 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-100 rounded-full opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full text-sm font-medium mb-12 shadow-lg backdrop-blur-sm border border-green-200/50">
            <Zap className="w-6 h-6 mr-3 animate-bounce" />
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            Powerful Features Built for Kenyan Schools
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Everything Your School Needs
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            From student enrollment to graduation, EduFam provides comprehensive tools 
            that adapt to your school's unique requirements and Kenya's educational standards.
          </p>
        </div>

        {/* Enhanced Features Grid with better animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          {coreFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 border-0 shadow-lg ${
                activeFeature === index 
                  ? 'ring-4 ring-blue-200 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-green-50' 
                  : 'hover:shadow-xl bg-white'
              }`}
              onClick={() => setActiveFeature(index)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <CardContent className="p-8">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="w-10 h-10 text-white filter drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{feature.description}</p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-xs text-green-700 group-hover:text-green-800 transition-colors duration-300">
                      <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-green-500" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Featured Detail Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-3xl p-12 shadow-2xl border border-white/50 backdrop-blur-sm relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-green-200/20 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full transform -translate-x-40 translate-y-40"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className={`inline-flex p-8 rounded-3xl bg-gradient-to-r ${coreFeatures[activeFeature].color} shadow-2xl mb-8 animate-pulse`}>
                {React.createElement(coreFeatures[activeFeature].icon, { 
                  className: "w-20 h-20 text-white filter drop-shadow-lg" 
                })}
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {coreFeatures[activeFeature].title}
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto font-light">
                {coreFeatures[activeFeature].description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coreFeatures[activeFeature].benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/50">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4 animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }} />
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">{benefit}</p>
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
