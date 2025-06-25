
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { testimonials } from "./landingData";

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 relative overflow-hidden">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-emerald-900/95"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `
        }}></div>
        
        {/* Floating elements */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
              borderRadius: "50%",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-yellow-300 rounded-full text-sm font-semibold mb-8">
            <Star className="w-5 h-5 mr-2 fill-current" />
            Trusted by School Leaders Across Kenya
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Success Stories from Our
            <span className="block bg-gradient-to-r from-yellow-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Amazing Schools
            </span>
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Hear directly from principals, teachers, and administrators who have
            transformed their schools with EduFam's comprehensive management system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/10 backdrop-blur-sm hover:bg-white/15"
            >
              <CardContent className="p-8">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Quote className="w-8 h-8 text-white" />
                </div>

                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-blue-200 text-sm">{testimonial.role}</p>
                    <p className="text-xs text-emerald-400 font-medium">
                      {testimonial.school}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <blockquote className="text-white/90 text-base leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-white/70">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
              <span className="text-sm">4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
              <span className="text-sm">98% Satisfaction Rate</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-sm">24/7 Local Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
