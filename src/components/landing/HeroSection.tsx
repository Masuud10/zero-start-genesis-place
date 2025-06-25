
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Award,
  Rocket,
  ArrowRight,
  Play,
  BookOpen,
  Users,
  GraduationCap,
  Star,
  Globe,
  Zap
} from "lucide-react";
import { stats } from "./landingData";

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onGetStarted, onWatchDemo }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32 min-h-screen flex items-center">
      {/* Enhanced Particle Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Floating particles with improved animations */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                backgroundColor: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
                borderRadius: "50%",
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                filter: "blur(0.5px)",
              }}
            ></div>
          ))}

          {/* Enhanced floating education icons with glow effect */}
          <div
            className="absolute top-32 left-1/4 animate-float opacity-20"
            style={{ 
              animationDelay: "0.5s",
              filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
            }}
          >
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <div
            className="absolute bottom-60 right-1/3 animate-float opacity-20"
            style={{ 
              animationDelay: "2s",
              filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))"
            }}
          >
            <Users className="w-16 h-16 text-green-400" />
          </div>
          <div
            className="absolute top-80 left-1/2 animate-float opacity-20"
            style={{ 
              animationDelay: "3s",
              filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))"
            }}
          >
            <GraduationCap className="w-14 h-14 text-purple-400" />
          </div>
          <div
            className="absolute top-1/2 right-1/4 animate-float opacity-20"
            style={{ 
              animationDelay: "1.5s",
              filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))"
            }}
          >
            <Star className="w-10 h-10 text-yellow-400" />
          </div>
          <div
            className="absolute bottom-1/3 left-1/6 animate-float opacity-20"
            style={{ 
              animationDelay: "4s",
              filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))"
            }}
          >
            <Globe className="w-12 h-12 text-red-400" />
          </div>

          {/* Enhanced gradient waves with better blending */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/40 via-transparent to-green-100/40 animate-pulse"></div>
            <div
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-purple-100/30 via-transparent to-yellow-100/30 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-pink-100/20 to-transparent animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Enhanced badge with better animations */}
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 rounded-full text-sm font-medium mb-12 animate-fade-in shadow-lg backdrop-blur-sm border border-blue-200/50">
            <Award className="w-6 h-6 mr-3 animate-bounce" />
            🇰🇪 #1 School Management System in Kenya
            <div className="ml-3 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>

          {/* Enhanced main heading with better gradient animation */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-gray-900 mb-12 animate-fade-in leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%] block mb-6">
              Empower Your School's Future
            </span>
            <span className="text-gray-800 text-5xl md:text-6xl lg:text-7xl block font-light">
              with <span className="font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">EduFam</span>
            </span>
          </h1>

          {/* Enhanced description with better typography */}
          <p className="text-xl md:text-2xl text-gray-600 mb-16 leading-relaxed max-w-5xl mx-auto animate-fade-in font-light">
            The most comprehensive school management system designed
            specifically for Kenyan schools. Streamline operations, enhance
            learning outcomes, and embrace digital transformation with our
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mx-2">
              IGCSE and CBC-compliant platform.
            </span>
          </p>

          {/* Enhanced CTA buttons with better hover effects */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 group text-xl px-16 py-8 rounded-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
              <Rocket className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
              <span className="relative z-10 font-bold">Start Free Trial</span>
              <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onWatchDemo}
              className="border-2 border-blue-300 text-blue-900 hover:bg-blue-50 hover:border-blue-400 transition-all duration-500 group text-xl px-16 py-8 rounded-full shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <Play className="w-7 h-7 mr-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold">Watch Demo</span>
            </Button>
          </div>

          {/* Enhanced stats grid with better animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group border border-white/50"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <div className="mb-6">
                  <stat.icon className="w-10 h-10 text-blue-600 mx-auto group-hover:scale-125 transition-transform duration-300 filter group-hover:drop-shadow-lg" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced floating elements for depth */}
          <div className="absolute top-20 right-10 opacity-10 animate-float">
            <Zap className="w-8 h-8 text-yellow-400" style={{ animationDelay: "2.5s" }} />
          </div>
          <div className="absolute bottom-20 left-10 opacity-10 animate-float">
            <Star className="w-6 h-6 text-pink-400" style={{ animationDelay: "1.8s" }} />
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
