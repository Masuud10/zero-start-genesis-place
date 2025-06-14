
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {coreFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                  activeFeature === index ? 'ring-4 ring-blue-200 shadow-2xl scale-105' : 'hover:shadow-lg'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative">
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
                <p className="text-lg text-gray-600 leading-relaxed">
                  {coreFeatures[activeFeature].description}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {coreFeatures[activeFeature].benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
