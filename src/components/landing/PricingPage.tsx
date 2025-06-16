import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Users, BookOpen, Shield, Clock } from "lucide-react";

interface PricingPageProps {
  onBackToHome: () => void;
  onContactSales: () => void;
  onScheduleDemo: () => void;
}

const PricingPage = ({
  onBackToHome,
  onContactSales,
  onScheduleDemo,
}: PricingPageProps) => {
  const allPlansInclude = [
    { icon: Users, text: "Student & Staff Management" },
    { icon: BookOpen, text: "CBC-Compliant Grading System" },
    { icon: Shield, text: "Advanced Security & Data Protection" },
    { icon: Clock, text: "24/7 Local Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Custom Pricing for Your School
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every school is unique. Let's create a plan that fits your specific
            needs, student count, and budget. Get personalized pricing designed
            for Kenyan schools.
          </p>
        </div>

        {/* Custom Pricing Card */}
        <div className="mb-16">
          <Card className="border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-green-600"></div>

            <CardHeader className="text-center pt-8 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Custom Enterprise Plan
              </CardTitle>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                Let's Talk
              </div>
              <p className="text-gray-600 text-lg">
                Tailored solution for your school's unique requirements
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <div className="space-y-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    What's Included in Your Custom Plan:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        Unlimited student records
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        Custom branding & themes
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        Advanced analytics & reporting
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        Priority support & training
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Custom integrations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        Dedicated account manager
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onContactSales}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-lg"
                >
                  Contact Our Team
                </Button>
                <Button
                  onClick={onScheduleDemo}
                  variant="outline"
                  className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 py-3 text-lg"
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Plans Include Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allPlansInclude.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your School?
          </h3>
          <p className="text-gray-600 mb-6">
            Join over 10+ schools across Kenya already using EduFam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onContactSales}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              Get Custom Quote
            </Button>
            <Button
              onClick={onScheduleDemo}
              variant="outline"
              size="lg"
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Book Free Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
