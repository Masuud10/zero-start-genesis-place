import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Award,
  Users,
  Globe,
  TrendingUp,
  Heart,
  CheckCircle,
} from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
  onContactUs: () => void;
  onGetStarted: () => void;
}

const AboutPage = ({ onBack, onContactUs, onGetStarted }: AboutPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-blue-600 hover:text-blue-800 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            About EduFam
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Kenyan education through intelligent school management
            solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-900">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To revolutionize education management in Kenya by providing
              comprehensive, CBC-compliant solutions that streamline operations,
              improve academic outcomes, and foster digital transformation in
              schools across the country.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-gray-700">CBC Curriculum Compliance</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-gray-700">M-Pesa Integration</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Local Support in Swahili & English
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Why Choose EduFam?</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="w-6 h-6 mr-3" />
                <span>10+ Schools Trust Us</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-3" />
                <span>Kenya-First Design</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-3" />
                <span>Proven Results</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-6 h-6 mr-3" />
                <span>Local Support Team</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-blue-900 mb-8">
            Ready to Transform Your School?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onContactUs}
              className="border-blue-300 text-blue-900 hover:bg-blue-50"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
