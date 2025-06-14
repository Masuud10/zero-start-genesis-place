
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface FeaturesPageProps {
  onBack: () => void;
  onGetStarted: () => void;
  onScheduleDemo: () => void;
}

const FeaturesPage = ({ onBack, onGetStarted, onScheduleDemo }: FeaturesPageProps) => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Complete student lifecycle management from enrollment to graduation with detailed profiles, academic history, and family connections.",
      benefits: ["Automated enrollment", "Digital records", "Parent portal access"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BookOpen,
      title: "Grade Management & CBC",
      description: "Advanced grading system supporting Kenya's CBC curriculum with competency-based assessments and automated report generation.",
      benefits: ["CBC compliance", "Automated calculations", "Progress tracking"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: UserCheck,
      title: "Attendance Tracking",
      description: "Real-time attendance monitoring with biometric integration, SMS notifications, and comprehensive reporting.",
      benefits: ["Real-time tracking", "Parent notifications", "Attendance analytics"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Complete fee management system with M-Pesa integration, automated billing, expense tracking, and detailed financial reporting.",
      benefits: ["M-Pesa integration", "Automated billing", "Financial reports"],
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Calendar,
      title: "Smart Timetabling",
      description: "AI-powered timetable generation that considers teacher availability, room capacity, and subject requirements.",
      benefits: ["AI optimization", "Conflict resolution", "Resource management"],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Comprehensive analytics dashboard with performance insights, predictive analytics, and customizable reports.",
      benefits: ["Performance insights", "Predictive analytics", "Custom reports"],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Integrated messaging system connecting teachers, students, and parents with announcements and direct messaging.",
      benefits: ["Multi-channel messaging", "Automated notifications", "Parent engagement"],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access, data encryption, audit trails, and compliance standards.",
      benefits: ["Role-based access", "Data encryption", "Audit trails"],
      color: "from-red-500 to-red-600"
    }
  ];

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
            Comprehensive Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything your Kenyan school needs in one powerful platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-xs text-green-700">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-blue-900 mb-6">Ready to See It in Action?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onScheduleDemo}
              className="border-blue-300 text-blue-900 hover:bg-blue-50"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
