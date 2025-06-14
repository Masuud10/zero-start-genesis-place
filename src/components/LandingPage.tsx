import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PromoVideo from '@/components/PromoVideo';
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
  const [showDemo, setShowDemo] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const pricingPlans = [
    {
      name: "Starter",
      price: "KES 15,000",
      period: "/month",
      description: "Perfect for small schools getting started",
      students: "Up to 200 students",
      features: [
        "Basic student management",
        "CBC grade recording",
        "M-Pesa fee collection",
        "Parent communication",
        "Basic reports",
        "Email support"
      ],
      popular: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Professional",
      price: "KES 35,000",
      period: "/month",
      description: "Most popular for growing schools",
      students: "Up to 800 students",
      features: [
        "Everything in Starter",
        "Advanced analytics",
        "Timetable management",
        "Bulk SMS & notifications",
        "Custom report builder",
        "Staff management",
        "Priority support"
      ],
      popular: true,
      color: "from-green-500 to-green-600"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large institutions and school networks",
      students: "Unlimited students",
      features: [
        "Everything in Professional",
        "Multi-school management",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "On-site training"
      ],
      popular: false,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const resources = [
    {
      icon: FileText,
      title: "Implementation Guide",
      description: "Step-by-step guide to getting started with EduFam",
      action: "Download PDF",
      type: "guide"
    },
    {
      icon: Video,
      title: "Training Videos",
      description: "Comprehensive video tutorials for all user roles",
      action: "Watch Now",
      type: "video"
    },
    {
      icon: BookmarkPlus,
      title: "Best Practices",
      description: "Learn from successful schools using EduFam",
      action: "Read More",
      type: "article"
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Frequently asked questions and answers",
      action: "Browse FAQ",
      type: "faq"
    }
  ];

  const handleNavClick = (section: string) => {
    setCurrentPage(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
    window.open('mailto:info@edufam.co.ke?subject=General Inquiry&body=Hello, I would like to know more about EduFam school management system.', '_blank');
  };

  const handleGetStarted = () => {
    onLoginClick();
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/edufam-demo', '_blank');
  };

  const handlePricing = () => {
    setCurrentPage('pricing');
    handleNavClick('pricing');
  };

  const handleLearnMore = (featureTitle: string) => {
    alert(`${featureTitle} - Detailed Information:\n\nThis feature is specifically designed for Kenyan schools with local curriculum support, M-Pesa integration, and compliance with MOE requirements.\n\nContact our team for a personalized demonstration showing how this feature works with your school's specific needs.`);
  };

  const handleDownloadResource = (resourceType: string) => {
    switch (resourceType) {
      case 'guide':
        alert('Implementation Guide downloading... This comprehensive PDF guide will help you set up EduFam for your school in just a few steps.');
        break;
      case 'video':
        setShowVideoModal(true);
        break;
      case 'article':
        alert('Opening best practices article... Learn how schools across Kenya have successfully implemented EduFam.');
        break;
      case 'faq':
        alert('Opening FAQ section... Find answers to common questions about EduFam features and implementation.');
        break;
      default:
        alert('Resource loading...');
    }
  };

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Enterprise') {
      handleContactSales();
    } else {
      alert(`You've selected the ${planName} plan!\n\nNext steps:\n1. Start your 30-day free trial\n2. Our team will help you set up your school\n3. Import your existing data\n4. Train your staff\n\nClick "Start Free Trial" to begin!`);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced Video Modal Component with the new PromoVideo
  const VideoModal = () => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-900 to-green-900 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-scale-in shadow-2xl transform border border-white/20">
        <div className="p-6 border-b border-white/20 flex items-center justify-between bg-gradient-to-r from-blue-900/80 to-green-900/80 backdrop-blur-sm">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            EduFam Promotional Video
          </h3>
          <Button 
            variant="ghost" 
            onClick={handleCloseVideoModal} 
            className="p-3 hover:bg-white/10 hover:text-white transition-all duration-300 rounded-full text-white/80 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="p-2">
          <div className="aspect-video rounded-2xl overflow-hidden">
            <PromoVideo onClose={handleCloseVideoModal} />
          </div>
        </div>
      </div>
    </div>
  );

  // Pricing Page Component
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your school. All plans include M-Pesa integration, 
            CBC compliance, and 24/7 support from our Kenyan team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 text-center mb-2">{plan.name}</h3>
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-blue-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600 text-center mb-4">{plan.description}</p>
                <p className="text-blue-600 font-medium text-center mb-6">{plan.students}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white transition-all duration-300 transform hover:scale-105`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
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

  // Resources Page Component
  const ResourcesPage = () => (
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
            Resources & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to successfully implement and use EduFam in your school.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <resource.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{resource.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>
                <Button 
                  onClick={() => handleDownloadResource(resource.type)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group-hover:scale-105 transition-transform"
                >
                  {resource.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-8">Need More Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              onClick={handleContactUs}
              variant="outline"
              className="h-20 flex-col space-y-2 border-blue-300 hover:bg-blue-50"
            >
              <Mail className="w-6 h-6 text-blue-600" />
              <span>Email Support</span>
            </Button>
            <Button 
              onClick={() => window.open('tel:+254700000000', '_blank')}
              variant="outline"
              className="h-20 flex-col space-y-2 border-green-300 hover:bg-green-50"
            >
              <Phone className="w-6 h-6 text-green-600" />
              <span>Call Us</span>
            </Button>
            <Button 
              onClick={handleScheduleDemo}
              variant="outline"
              className="h-20 flex-col space-y-2 border-purple-300 hover:bg-purple-50"
            >
              <Calendar className="w-6 h-6 text-purple-600" />
              <span>Book Demo</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Enhanced Navigation Header */}
      <nav className="bg-white/98 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <img 
                  src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
                  alt="EduFam Logo" 
                  className="w-12 h-12 object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-green-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-green-600 to-blue-900 bg-clip-text text-transparent">
                EduFam
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={() => handleNavClick('features')}
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={() => setCurrentPage('pricing')}
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={() => setCurrentPage('resources')}
              >
                Resources
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={handleContactUs}
              >
                Contact
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 hover:from-blue-700 hover:via-green-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300 relative" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
        
        {/* Enhanced Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                background: `linear-gradient(45deg, hsl(${Math.random() * 60 + 200}, 70%, 60%), hsl(${Math.random() * 60 + 120}, 70%, 60%))`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 via-green-50 to-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-lg border border-blue-200/50 backdrop-blur-sm">
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                🇰🇪 Proudly Kenyan • Trusted by 1,000+ schools
                <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-blue-900 leading-tight">
                Empower Your
                <span className="block bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
                  School's Future
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Kenya's most comprehensive school management system. Built for CBC curriculum, 
                M-Pesa integration, and the unique needs of Kenyan educational institutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 hover:from-blue-700 hover:via-green-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:scale-110 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300 relative" />
                  <span className="relative">Start Free Trial</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300 relative" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWatchDemo}
                  disabled={showDemo}
                  className="border-blue-300 text-blue-900 hover:bg-blue-50 transition-all duration-300 group hover:shadow-lg backdrop-blur-sm bg-white/80"
                >
                  {showDemo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading Demo...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform duration-300" />
                      Watch Demo
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleScheduleDemo}
                  className="border-green-300 text-green-900 hover:bg-green-50 transition-all duration-300 group hover:shadow-lg backdrop-blur-sm bg-white/80"
                >
                  <Calendar className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform duration-300" />
                  Book Demo
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                {[
                  { icon: CheckCircle, text: "30-day free trial" },
                  { icon: CheckCircle, text: "CBC compliant" },
                  { icon: CheckCircle, text: "M-Pesa ready" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <item.icon className="w-5 h-5 text-green-500 mr-2 animate-pulse" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 via-green-500 to-purple-600 rounded-3xl p-8 shadow-2xl transform hover:rotate-1 transition-all duration-700 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
                        alt="EduFam" 
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <div className="h-3 bg-gradient-to-r from-blue-200 to-green-200 rounded w-24 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-pulse">98%</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { color: "blue", width: "w-20" },
                      { color: "green", width: "w-16" },
                      { color: "purple", width: "w-24" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className={`h-3 bg-${item.color}-200 rounded ${item.width} animate-pulse`} style={{ animationDelay: `${index * 200}ms` }}></div>
                        <div className={`h-3 bg-${item.color}-500 rounded w-12 animate-pulse`} style={{ animationDelay: `${index * 200 + 100}ms` }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: BarChart3, color: "blue", delay: "0s" },
                      { icon: TrendingUp, color: "green", delay: "0.2s" },
                      { icon: Award, color: "purple", delay: "0.4s" }
                    ].map((item, index) => (
                      <div key={index} className={`h-16 bg-gradient-to-t from-${item.color}-100 to-${item.color}-200 rounded-lg flex items-end p-2 hover:scale-105 transition-transform duration-300`}>
                        <item.icon className={`w-4 h-4 text-${item.color}-600 animate-bounce`} style={{ animationDelay: item.delay }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 via-green-50 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6 border border-blue-200/50 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: '4s' }} />
              Comprehensive School Management Excellence
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
              Everything Your School Needs in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              From CBC-compliant grading to M-Pesa fee collection, EduFam provides all the tools 
              Kenyan schools need to thrive in the digital age.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 border-0 shadow-lg cursor-pointer bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden ${
                  activeFeature === index ? 'ring-2 ring-blue-400 shadow-2xl scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => handleLearnMore(feature.title)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-6 relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-xl relative`}>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <feature.icon className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-xs text-green-700 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ transitionDelay: `${benefitIndex * 100}ms` }}>
                        <CheckSquare className="w-3 h-3 mr-2 animate-pulse" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 mt-4 transform translate-y-4 group-hover:translate-y-0">
                    <Button variant="ghost" className="text-blue-600 font-medium p-0 h-auto hover:text-blue-800 text-sm group-hover:scale-105 transition-transform duration-300">
                      Learn more →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Live Animated Stats Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Live animated background */}
        <div className="absolute inset-0">
          {/* Gradient background with animated mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-green-800 to-purple-900"></div>
          
          {/* Animated mesh overlay */}
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)
              `
            }}
          ></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Animated wave lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,50 Q25,30 50,50 T100,50"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M0,60 Q25,40 50,60 T100,60"
              stroke="white"
              strokeWidth="0.3"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
          
          {/* Interactive mouse-following gradient */}
          <div 
            className="absolute w-96 h-96 rounded-full opacity-20 transition-all duration-1000 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              left: `${mousePosition.x - 192}px`,
              top: `${mousePosition.y - 192}px`,
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Leading Educational Technology in Kenya
            </h2>
            <p className="text-blue-200 text-xl leading-relaxed max-w-3xl mx-auto">
              Trusted by schools nationwide for excellence and innovation in digital education management
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group cursor-pointer" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 group-hover:scale-125 transform relative overflow-hidden border border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-green-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <stat.icon className="w-10 h-10 text-white animate-pulse relative z-10" />
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text">{stat.number}</div>
                <div className="text-blue-200 font-semibold mb-2 text-lg">{stat.label}</div>
                <div className="text-blue-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Heart className="w-4 h-4 mr-2 animate-pulse" />
              Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 animate-fade-in">
              What Kenyan Educators Are Saying
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in">
              Real feedback from real schools across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 animate-pulse">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-600">{testimonial.role}</div>
                      <div className="text-blue-600 text-sm">{testimonial.school}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-blue-900 via-green-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Award className="w-4 h-4 mr-2 animate-bounce" />
            Transform Your School Today
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Ready to Join Kenya's Educational Revolution?
          </h2>
          <p className="text-xl text-blue-200 mb-8 leading-relaxed animate-fade-in">
            Join over 1,000 Kenyan schools already using EduFam to streamline operations, 
            improve academic outcomes, and embrace digital transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group text-lg px-8 py-4"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleContactSales}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-300 group text-lg px-8 py-4"
            >
              <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Contact Sales
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleScheduleDemo}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-300 group text-lg px-8 py-4"
            >
              <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Book Demo
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-200">
            <div className="flex items-center justify-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 animate-pulse" />
              No credit card required
            </div>
            <div className="flex items-center justify-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 animate-pulse" />
              CBC compliant system
            </div>
            <div className="flex items-center justify-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 animate-pulse" />
              M-Pesa integration included
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
                  alt="EduFam Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="text-2xl font-bold">EduFam</span>
              </div>
              <p className="text-blue-200 mb-6 leading-relaxed">
                Empowering Kenyan education through intelligent school management solutions. 
                Built for CBC curriculum, M-Pesa integration, and the unique needs of African schools.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3 transition-all duration-300 hover:scale-110"
                  onClick={() => window.open('mailto:info@edufam.co.ke', '_blank')}
                >
                  <Mail className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3 transition-all duration-300 hover:scale-110"
                  onClick={() => window.open('tel:+254700000000', '_blank')}
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3 transition-all duration-300 hover:scale-110"
                  onClick={() => alert('Visit us at: EduFam Headquarters, Nairobi, Kenya')}
                >
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Platform</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => handleNavClick('features')}>Features</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => setCurrentPage('pricing')}>Pricing</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('CBC Integration: Full support for Kenya\'s Competency-Based Curriculum')}>CBC Support</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('M-Pesa Integration: Seamless mobile money payments for school fees')}>M-Pesa Integration</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => setCurrentPage('resources')}>Documentation</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => setCurrentPage('resources')}>Help Center</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={handleContactUs}>Contact Support</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('Training: Free onboarding, video tutorials, and live training sessions in Swahili and English')}>Training</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => handleNavClick('about')}>About EduFam</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('Careers: Join our mission to transform African education. Multiple positions available in Nairobi!')}>Careers</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('Privacy Policy: We protect your data with industry-leading security measures and GDPR compliance')}>Privacy</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('Terms of Service: Fair and transparent terms designed for Kenyan educational institutions')}>Terms</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 mb-4 md:mb-0">&copy; 2024 EduFam. All rights reserved. Made with ❤️ in Kenya.</p>
            <div className="flex space-x-6 text-blue-200 text-sm">
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('System Status: All systems operational across Kenya')}>
                System Status
              </Button>
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('API: Developer-friendly REST API for schools wanting custom integrations')}>
                API
              </Button>
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('Partners: Join our partner program for educational consultants and technology providers')}>
                Partners
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // Render current page based on state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'pricing':
        return <PricingPage />;
      case 'resources':
        return <ResourcesPage />;
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
          }
        `}
      </style>
      {renderCurrentPage()}
      {showVideoModal && <VideoModal />}
    </>
  );
};

export default LandingPage;
