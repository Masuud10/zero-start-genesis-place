
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap } from 'lucide-react';
import { coreFeatures } from './landingData';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
            <Zap className="w-5 h-5 mr-2" />
            Powerful Features Built for Kenyan Schools
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Everything Your School Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From student enrollment to graduation, EduFam provides comprehensive tools 
            that adapt to your school's unique requirements and Kenya's educational standards.
          </p>
        </div>

        {/* Comprehensive Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                activeFeature === index ? 'ring-4 ring-blue-200 shadow-2xl scale-105' : 'hover:shadow-lg'
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-xs text-green-700">
                      <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Detail Section */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${coreFeatures[activeFeature].color} shadow-2xl mb-6`}>
              {React.createElement(coreFeatures[activeFeature].icon, { 
                className: "w-16 h-16 text-white" 
              })}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {coreFeatures[activeFeature].title}
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {coreFeatures[activeFeature].description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreFeatures[activeFeature].benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
