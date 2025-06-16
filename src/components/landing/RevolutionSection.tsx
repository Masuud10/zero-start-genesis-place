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
    <section className="py-32 bg-gradient-to-br from-blue-900 via-green-800 to-purple-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Multiple gradient layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-green-800/90 to-purple-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/20 to-green-500/20"></div>

        {/* Animated floating elements */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
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

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Enhanced badge */}
        <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium mb-8 animate-fade-in shadow-xl">
          <Rocket className="w-5 h-5 mr-2 animate-bounce" />
          🇰🇪 Transform Your School Today
          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        </div>

        {/* Main heading with enhanced styling */}
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 animate-fade-in leading-tight">
          Ready to Join Kenya's
          <span className="block bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
            Educational Revolution?
          </span>
        </h2>

        {/* Enhanced description */}
        <p className="text-xl md:text-2xl text-blue-200 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in">
          Join over{" "}
          <span className="font-bold text-yellow-400">10+ Kenyan schools</span>{" "}
          already using EduFam to streamline operations, improve academic
          outcomes, and embrace digital transformation.
          <span className="block mt-4 text-lg text-green-300">
            Be part of the future of education in Africa.
          </span>
        </p>

        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 via-green-500 to-blue-500 hover:from-yellow-600 hover:via-green-600 hover:to-blue-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 group text-xl px-12 py-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
            <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300 relative" />
            <span className="relative font-bold">Start Free Trial Now</span>
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300 relative" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onContactSales}
            className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-900 transition-all duration-500 group text-xl px-12 py-6"
          >
            <Phone className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold">Contact Sales Team</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onScheduleDemo}
            className="border-2 border-green-400 bg-green-500/20 backdrop-blur-sm text-white hover:bg-green-400 hover:text-green-900 transition-all duration-500 group text-xl px-12 py-6"
          >
            <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold">Book Live Demo</span>
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
              icon: Globe,
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
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <item.icon className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="font-bold text-white text-lg mb-1">{item.text}</p>
              <p className="text-blue-200 text-sm">{item.subtext}</p>
            </div>
          ))}
        </div>

        {/* Success metrics */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">
            Join Schools That Have Already Transformed
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                98%
              </div>
              <div className="text-white text-sm">Satisfaction Rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                300%
              </div>
              <div className="text-white text-sm">Efficiency Increase</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">
                10+
              </div>
              <div className="text-white text-sm">Schools Served</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300">
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
