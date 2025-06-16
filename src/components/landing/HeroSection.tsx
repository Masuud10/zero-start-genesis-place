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
} from "lucide-react";
import { stats } from "./landingData";

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onGetStarted, onWatchDemo }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32">
      {/* Beautiful Particle Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Floating particles */}
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, 70%)`,
                borderRadius: "50%",
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            ></div>
          ))}

          {/* Floating education icons */}
          <div
            className="absolute top-32 left-1/3 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            <BookOpen className="w-8 h-8 text-blue-300/50" />
          </div>
          <div
            className="absolute bottom-60 right-1/4 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <Users className="w-10 h-10 text-green-300/50" />
          </div>
          <div
            className="absolute top-80 left-1/2 animate-float"
            style={{ animationDelay: "3s" }}
          >
            <GraduationCap className="w-12 h-12 text-purple-300/50" />
          </div>

          {/* Gradient waves */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/30 via-transparent to-green-100/30 animate-pulse"></div>
            <div
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-purple-100/20 via-transparent to-yellow-100/20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Award className="w-5 h-5 mr-2" />
            🇰🇪 #1 School Management System in Kenya
            <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 animate-fade-in leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x block mb-4">
              Empower Your School's Future
            </span>
            <span className="text-gray-800 text-4xl md:text-5xl lg:text-6xl block">
              with EduFam
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in">
            The most comprehensive school management system designed
            specifically for Kenyan schools. Streamline operations, enhance
            learning outcomes, and embrace digital transformation with our
            <span className="font-semibold text-blue-600">
              {" "}
              IGCSE and CBC-compliant platform.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 group text-xl px-12 py-6"
            >
              <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Start Free Trial
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onWatchDemo}
              className="border-2 border-blue-300 text-blue-900 hover:bg-blue-50 transition-all duration-500 group text-xl px-12 py-6"
            >
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
