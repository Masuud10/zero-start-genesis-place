
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  ArrowRight, 
  Calendar, 
  CheckCircle,
  Shield,
  Globe,
  BookOpen,
  Headphones
} from 'lucide-react';

interface PricingPageProps {
  onBackToHome: () => void;
  onContactSales: () => void;
  onScheduleDemo: () => void;
}

const PricingPage = ({ onBackToHome, onContactSales, onScheduleDemo }: PricingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Button 
            variant="ghost" 
            onClick={onBackToHome}
            className="mb-8 text-blue-600 hover:text-blue-800 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            Custom Pricing for Your School
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get a personalized solution tailored to your school's unique needs. 
            Our team will work with you to create the perfect package.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-xl">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-blue-600 text-white text-center py-3 text-lg font-medium">
              Recommended for All Schools
            </div>
            <CardContent className="p-12 pt-20">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-600 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-blue-900 text-center mb-4">Custom Pricing</h3>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-blue-900">Contact Us</span>
                <p className="text-gray-600 mt-2 text-lg">for personalized quote</p>
              </div>
              <p className="text-gray-600 text-center mb-6 text-lg">
                Tailored solutions for schools of all sizes with flexible pricing 
                based on your specific requirements and number of students.
              </p>
              
              <div className="space-y-4 mb-8">
                <h4 className="font-bold text-blue-900 text-lg text-center mb-4">What You Get:</h4>
                {[
                  "Complete school management system",
                  "CBC-compliant grading and assessments", 
                  "M-Pesa payment integration",
                  "Student & parent portals",
                  "Staff management tools",
                  "Advanced analytics & reporting",
                  "Communication platform",
                  "Attendance tracking",
                  "Timetable management",
                  "Free training & onboarding",
                  "24/7 local support",
                  "Custom integrations available"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={onContactSales}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 transform hover:scale-105 text-lg py-6"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Our Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button 
                  onClick={onScheduleDemo}
                  variant="outline"
                  className="w-full border-2 border-blue-300 text-blue-900 hover:bg-blue-50 transition-all duration-300 text-lg py-6"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule a Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">All Plans Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-green-500 mx-auto" />
                <p className="font-medium">30-Day Free Trial</p>
              </div>
              <div className="space-y-2">
                <Globe className="w-8 h-8 text-blue-500 mx-auto" />
                <p className="font-medium">M-Pesa Integration</p>
              </div>
              <div className="space-y-2">
                <BookOpen className="w-8 h-8 text-purple-500 mx-auto" />
                <p className="font-medium">CBC Compliance</p>
              </div>
              <div className="space-y-2">
                <Headphones className="w-8 h-8 text-orange-500 mx-auto" />
                <p className="font-medium">Local Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
