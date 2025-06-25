
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  ArrowRight,
  Phone,
  Calendar,
  CheckCircle,
  Globe,
  Zap,
  Shield
} from "lucide-react";

interface RevolutionSectionProps {
  onGetStarted: () => void;
  onContactSales: () => void;
  onScheduleDemo: () => void;
}

const RevolutionSection = ({
  onGetStarted,
  onContactSales,
  onScheduleDemo,
}: RevolutionSectionProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-emerald-600 to-purple-600 relative overflow-hidden">
      {/* Enhanced background with improved layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-emerald-600/90 to-purple-600/90"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/20 to-emerald-500/20"></div>

        {/* Refined floating elements */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
                borderRadius: "50%",
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px"
          }}></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Enhanced badge */}
        <div className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-semibold mb-8 shadow-lg">
          <Rocket className="w-5 h-5 mr-2 animate-bounce" />
          🇰🇪 Transform Your School Today
          <div className="ml-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        </div>

        {/* Enhanced main heading */}
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          Ready to Join Kenya's
          <span className="block bg-gradient-to-r from-yellow-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
            Educational Revolution?
          </span>
        </h2>

        {/* Improved description */}
        <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-4xl mx-auto">
          Join over <span className="font-bold text-yellow-300">10+ Kenyan schools</span> already using EduFam 
          to streamline operations, improve academic outcomes, and embrace digital transformation.
          <span className="block mt-4 text-lg text-emerald-200">
            Be part of the future of education in Africa.
          </span>
        </p>

        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group text-xl px-12 py-6 font-bold rounded-xl"
          >
            <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
            Start Free Trial Now
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onContactSales}
            className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 group text-xl px-12 py-6 font-bold rounded-xl"
          >
            <Phone className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Contact Sales Team
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onScheduleDemo}
            className="border-2 border-emerald-400/60 bg-emerald-500/20 backdrop-blur-sm text-white hover:bg-emerald-400/30 hover:border-emerald-400 transition-all duration-300 group text-xl px-12 py-6 font-bold rounded-xl"
          >
            <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Book Live Demo
          </Button>
        </div>

        {/* Enhanced feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: CheckCircle,
              text: "30-day free trial",
              subtext: "No credit card required",
            },
            {
              icon: Shield,
              text: "CBC compliant system",
              subtext: "MOE approved curriculum",
            },
            {
              icon: Zap,
              text: "M-Pesa integration included",
              subtext: "Seamless payments",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 group"
            >
              <item.icon className="w-8 h-8 text-emerald-300 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="font-bold text-white text-lg mb-1">{item.text}</p>
              <p className="text-blue-200 text-sm">{item.subtext}</p>
            </div>
          ))}
        </div>

        {/* Success metrics with better styling */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">
            Join Schools That Have Already Transformed
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300 mb-1">
                98%
              </div>
              <div className="text-white text-sm">Satisfaction Rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-emerald-400 group-hover:scale-110 transition-transform duration-300 mb-1">
                300%
              </div>
              <div className="text-white text-sm">Efficiency Increase</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300 mb-1">
                10+
              </div>
              <div className="text-white text-sm">Schools Served</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300 mb-1">
                24/7
              </div>
              <div className="text-white text-sm">Local Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevolutionSection;
