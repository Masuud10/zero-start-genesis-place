
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
  Zap,
  CheckCircle
} from "lucide-react";
import { stats } from "./landingData";

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onGetStarted, onWatchDemo }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 pt-24 pb-32 min-h-screen flex items-center">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(30, 58, 138, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(30, 58, 138, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }}></div>
        </div>

        {/* Floating education icons with improved positioning */}
        <div className="absolute top-32 left-1/4 animate-float opacity-15" style={{ animationDelay: "0.5s" }}>
          <BookOpen className="w-14 h-14 text-blue-500" />
        </div>
        <div className="absolute bottom-60 right-1/3 animate-float opacity-15" style={{ animationDelay: "2s" }}>
          <Users className="w-18 h-18 text-emerald-500" />
        </div>
        <div className="absolute top-80 left-1/2 animate-float opacity-15" style={{ animationDelay: "3s" }}>
          <GraduationCap className="w-16 h-16 text-purple-500" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float opacity-15" style={{ animationDelay: "1.5s" }}>
          <Star className="w-12 h-12 text-yellow-500" />
        </div>
        <div className="absolute bottom-1/3 left-1/6 animate-float opacity-15" style={{ animationDelay: "4s" }}>
          <Globe className="w-14 h-14 text-indigo-500" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Enhanced badge with subtle animation */}
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 rounded-full text-sm font-semibold mb-12 animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 group">
            <Award className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
            🇰🇪 #1 School Management System in Kenya
            <div className="ml-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>

          {/* Enhanced main heading with better typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 animate-fade-in leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%] block mb-4">
              Transform Education
            </span>
            <span className="text-slate-700 text-4xl md:text-5xl lg:text-6xl block font-medium">
              with <span className="font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">EduFam</span>
            </span>
          </h1>

          {/* Enhanced description with better spacing */}
          <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in font-light">
            The most comprehensive school management system designed specifically for Kenyan schools. 
            <span className="block mt-3">
              Streamline operations, enhance learning outcomes, and embrace digital transformation with our
              <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg mx-2">
                IGCSE and CBC-compliant platform.
              </span>
            </span>
          </p>

          {/* Enhanced CTA buttons with improved styling */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group text-lg px-12 py-6 rounded-xl font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onWatchDemo}
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 group text-lg px-12 py-6 rounded-xl font-semibold backdrop-blur-sm bg-white/50"
            >
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Enhanced stats grid with improved cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group border border-white/50 hover:border-white/80"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col items-center">
            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Trusted by 10+ Kenyan schools</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>MOE approved</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>24/7 local support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
