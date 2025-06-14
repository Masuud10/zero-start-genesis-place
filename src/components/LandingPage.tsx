
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PromoVideo from '@/components/PromoVideo';
import AboutPage from '@/components/pages/AboutPage';
import FeaturesPage from '@/components/pages/FeaturesPage';
import ContactPage from '@/components/pages/ContactPage';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Smartphone,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  BarChart3,
  Globe,
  Zap,
  DollarSign,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  UserCheck,
  CreditCard,
  PieChart,
  Target,
  Lightbulb,
  Rocket,
  Heart,
  CheckSquare,
  Download,
  Video,
  BookmarkPlus,
  HelpCircle,
  Building,
  GraduationCapIcon,
  Calculator,
  School,
  Users2,
  Trophy,
  Briefcase,
  MonitorPlay,
  Headphones,
  FileQuestion,
  ArrowLeft,
  X
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  const coreFeatures = [
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
      description: "Real-time attendance monitoring with biometric integration, SMS notifications, and comprehensive reporting for better student accountability.",
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
      description: "AI-powered timetable generation that considers teacher availability, room capacity, and subject requirements for optimal scheduling.",
      benefits: ["AI optimization", "Conflict resolution", "Resource management"],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Comprehensive analytics dashboard with performance insights, predictive analytics, and customizable reports for data-driven decisions.",
      benefits: ["Performance insights", "Predictive analytics", "Custom reports"],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Integrated messaging system connecting teachers, students, and parents with announcements, direct messaging, and notification management.",
      benefits: ["Multi-channel messaging", "Automated notifications", "Parent engagement"],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access, data encryption, audit trails, and compliance with educational data protection standards.",
      benefits: ["Role-based access", "Data encryption", "Audit trails"],
      color: "from-red-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Grace Wanjiku",
      role: "Principal, Nairobi International School",
      content: "EduFam has revolutionized our school management. The CBC integration is seamless and our efficiency has improved by 300%.",
      rating: 5,
      avatar: "GW",
      school: "Nairobi International School"
    },
    {
      name: "John Kamau",
      role: "Finance Director, Mombasa Academy",
      content: "The M-Pesa integration and automated fee collection has eliminated our payment tracking headaches completely.",
      rating: 5,
      avatar: "JK",
      school: "Mombasa Academy"
    },
    {
      name: "Prof. Sarah Nyong'o",
      role: "Academic Director, Kisumu Learning Center",
      content: "Our teachers love the grading system and parents appreciate the real-time updates on their children's progress.",
      rating: 5,
      avatar: "SN",
      school: "Kisumu Learning Center"
    }
  ];

  const stats = [
    { number: "1,000+", label: "Schools Empowered", icon: Globe, description: "Trusted across Kenya" },
    { number: "200K+", label: "Students Managed", icon: Users, description: "Growing daily" },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield, description: "Always available" },
    { number: "24/7", label: "Expert Support", icon: Clock, description: "Local support team" }
  ];

  // Fixed button handlers
  const handleGetStarted = () => {
    onLoginClick();
  };

  const handleWatchDemo = () => {
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };

  const handleContactSales = () => {
    window.open('mailto:sales@edufam.co.ke?subject=Sales Inquiry - EduFam School Management System&body=Hello, I am interested in learning more about EduFam for my school. Please contact me to discuss pricing and features specific to Kenyan schools.', '_blank');
  };

  const handleContactUs = () => {
    setCurrentPage('contact');
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/edufam-demo', '_blank');
  };

  const handlePricing = () => {
    setCurrentPage('pricing');
  };

  const handleNavClick = (section: string) => {
    if (section === 'features') {
      setCurrentPage('features');
    } else if (section === 'about') {
      setCurrentPage('about');
    } else if (section === 'contact') {
      setCurrentPage('contact');
    } else {
      setCurrentPage('home');
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced Video Modal Component
  const VideoModal = () => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-2 md:p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-900 to-green-900 rounded-2xl md:rounded-3xl w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-6xl overflow-hidden animate-scale-in shadow-2xl transform border border-white/20">
        <div className="p-3 md:p-6 border-b border-white/20 flex items-center justify-between bg-gradient-to-r from-blue-900/80 to-green-900/80 backdrop-blur-sm">
          <h3 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            EduFam Promotional Video
          </h3>
          <Button 
            variant="ghost" 
            onClick={handleCloseVideoModal} 
            className="p-2 md:p-3 hover:bg-white/10 hover:text-white transition-all duration-300 rounded-full text-white/80 hover:scale-110"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
        <div className="p-1 md:p-2 h-[calc(100%-60px)] md:h-[calc(100%-80px)]">
          <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden">
            <PromoVideo onClose={handleCloseVideoModal} />
          </div>
        </div>
      </div>
    </div>
  );

  // Updated Pricing Page Component with single custom pricing
  const PricingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
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
                  onClick={handleContactSales}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all duration-300 transform hover:scale-105 text-lg py-6"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Our Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button 
                  onClick={handleScheduleDemo}
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

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <GraduationCap className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  EduFam
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => handleNavClick('home')}
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => handleNavClick('features')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleNavClick('about')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => handleNavClick('contact')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </button>
                <button 
                  onClick={handlePricing}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleGetStarted}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with New Animation */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32">
        {/* New Beautiful Geometric Animation Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            {/* Animated geometric shapes */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-green-200/30 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-purple-200/30 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
            <div className="absolute top-60 right-1/3 w-24 h-24 bg-yellow-200/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
            
            {/* Floating education icons */}
            <div className="absolute top-32 left-1/3 animate-float" style={{ animationDelay: '0.5s' }}>
              <BookOpen className="w-8 h-8 text-blue-300/50" />
            </div>
            <div className="absolute bottom-60 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
              <Users className="w-10 h-10 text-green-300/50" />
            </div>
            <div className="absolute top-80 left-1/2 animate-float" style={{ animationDelay: '3s' }}>
              <GraduationCap className="w-12 h-12 text-purple-300/50" />
            </div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px'
              }}></div>
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
              The most comprehensive school management system designed specifically for Kenyan schools. 
              Streamline operations, enhance learning outcomes, and embrace digital transformation with our 
              <span className="font-semibold text-blue-600"> CBC-compliant platform.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={handleGetStarted}
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
                onClick={handleWatchDemo}
                className="border-2 border-blue-300 text-blue-900 hover:bg-blue-50 transition-all duration-500 group text-xl px-12 py-6"
              >
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              <Zap className="w-5 h-5 mr-2" />
              Powerful Features Built for Kenyan Schools
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From student enrollment to graduation, EduFam provides comprehensive tools 
              that adapt to your school's unique requirements and Kenya's educational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {coreFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    activeFeature === index ? 'ring-4 ring-blue-200 shadow-2xl scale-105' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.benefits.map((benefit, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${coreFeatures[activeFeature].color} shadow-2xl mb-6`}>
                    {React.createElement(coreFeatures[activeFeature].icon, { 
                      className: "w-16 h-16 text-white" 
                    })}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {coreFeatures[activeFeature].title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {coreFeatures[activeFeature].description}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {coreFeatures[activeFeature].benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-8">
              <Star className="w-5 h-5 mr-2 fill-current" />
              Trusted by School Leaders Across Kenya
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Success Stories from Our Schools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear directly from principals, teachers, and administrators who have transformed 
              their schools with EduFam's comprehensive management system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-blue-600 font-medium">{testimonial.school}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced "Ready to Join Kenya's Educational Revolution" Section */}
      <RevolutionSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-6">
                <GraduationCap className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold">EduFam</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering Kenyan schools with comprehensive management solutions 
                designed for the modern educational landscape.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleNavClick('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={handlePricing} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={handleScheduleDemo} className="hover:text-white transition-colors">Demo</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => handleNavClick('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>hello@edufam.co.ke</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduFam. All rights reserved. Proudly serving Kenyan schools.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Enhanced "Ready to Join Kenya's Educational Revolution" Section
  const RevolutionSection = () => (
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
                borderRadius: '50%',
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
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
          Join over <span className="font-bold text-yellow-400">1,000 Kenyan schools</span> already using EduFam to streamline operations, 
          improve academic outcomes, and embrace digital transformation. 
          <span className="block mt-4 text-lg text-green-300">
            Be part of the future of education in Africa.
          </span>
        </p>
        
        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button 
            onClick={handleGetStarted}
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
            onClick={handleContactSales}
            className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-900 transition-all duration-500 group text-xl px-12 py-6"
          >
            <Phone className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold">Contact Sales Team</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleScheduleDemo}
            className="border-2 border-green-400 bg-green-500/20 backdrop-blur-sm text-white hover:bg-green-400 hover:text-green-900 transition-all duration-500 group text-xl px-12 py-6"
          >
            <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold">Book Live Demo</span>
          </Button>
        </div>
        
        {/* Enhanced feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: CheckCircle, text: "30-day free trial", subtext: "No credit card required" },
            { icon: Globe, text: "CBC compliant system", subtext: "MOE approved curriculum" },
            { icon: Zap, text: "M-Pesa integration included", subtext: "Seamless payments" }
          ].map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 group">
              <item.icon className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="font-bold text-white text-lg mb-1">{item.text}</p>
              <p className="text-blue-200 text-sm">{item.subtext}</p>
            </div>
          ))}
        </div>
        
        {/* Success metrics */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">Join Schools That Have Already Transformed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-white text-sm">Satisfaction Rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">300%</div>
              <div className="text-white text-sm">Efficiency Increase</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">1,000+</div>
              <div className="text-white text-sm">Schools Served</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-white text-sm">Local Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Render current page based on state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage onBack={handleBackToHome} onContactUs={handleContactUs} onGetStarted={handleGetStarted} />;
      case 'features':
        return <FeaturesPage onBack={handleBackToHome} onGetStarted={handleGetStarted} onScheduleDemo={handleScheduleDemo} />;
      case 'contact':
        return <ContactPage onBack={handleBackToHome} />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(-10px) rotate(-5deg); }
          }
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
            background-size: 400% 400%;
          }
        `}
      </style>
      {renderCurrentPage()}
      {showVideoModal && <VideoModal />}
    </>
  );
};

export default LandingPage;
