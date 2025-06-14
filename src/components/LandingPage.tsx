
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  CheckSquare
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const [showDemo, setShowDemo] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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

  const handleNavClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchDemo = () => {
    setShowDemo(true);
    setTimeout(() => {
      setShowDemo(false);
      alert('Demo video would open here! Contact us to schedule a live demonstration tailored to your school needs.');
    }, 2000);
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
    alert('EduFam Pricing Plans:\n\nStarter: KES 15,000/month (up to 200 students)\nProfessional: KES 35,000/month (up to 800 students)\nEnterprise: Custom pricing for large institutions\n\nAll plans include M-Pesa integration, CBC support, and local support.\n\nContact sales for detailed pricing and school-specific features.');
  };

  const handleLearnMore = (featureTitle: string) => {
    alert(`${featureTitle} - Detailed Information:\n\nThis feature is specifically designed for Kenyan schools with local curriculum support, M-Pesa integration, and compliance with MOE requirements.\n\nContact our team for a personalized demonstration showing how this feature works with your school's specific needs.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <img 
                  src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
                  alt="EduFam Logo" 
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                EduFam
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200 hover:scale-105"
                onClick={() => handleNavClick('features')}
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200 hover:scale-105"
                onClick={handlePricing}
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200 hover:scale-105"
                onClick={() => handleNavClick('about')}
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200 hover:scale-105"
                onClick={handleContactUs}
              >
                Contact
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        
        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute top-60 left-1/2 w-14 h-14 bg-orange-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 rounded-full text-sm font-medium shadow-lg animate-pulse">
                <Zap className="w-4 h-4 mr-2" />
                🇰🇪 Proudly Kenyan • Trusted by 1,000+ schools
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-blue-900 leading-tight">
                Empower Your
                <span className="block bg-gradient-to-r from-blue-600 via-green-500 to-blue-800 bg-clip-text text-transparent animate-pulse">
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
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-105"
                >
                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWatchDemo}
                  disabled={showDemo}
                  className="border-blue-300 text-blue-900 hover:bg-blue-50 transition-all duration-300 group"
                >
                  {showDemo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading Demo...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Watch Demo
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleScheduleDemo}
                  className="border-green-300 text-green-900 hover:bg-green-50 transition-all duration-300 group"
                >
                  <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Book Demo
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 animate-pulse" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 animate-pulse" />
                  <span>CBC compliant</span>
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 animate-pulse" />
                  <span>M-Pesa ready</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-1 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
                        alt="EduFam" 
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <div className="h-3 bg-blue-200 rounded w-24 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 animate-pulse">98%</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-blue-200 rounded w-20"></div>
                      <div className="h-3 bg-blue-500 rounded w-12 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-green-200 rounded w-16"></div>
                      <div className="h-3 bg-green-500 rounded w-8 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-purple-200 rounded w-24"></div>
                      <div className="h-3 bg-purple-500 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gradient-to-t from-blue-100 to-blue-200 rounded-lg flex items-end p-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 animate-bounce" />
                    </div>
                    <div className="h-16 bg-gradient-to-t from-green-100 to-green-200 rounded-lg flex items-end p-2">
                      <TrendingUp className="w-4 h-4 text-green-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <div className="h-16 bg-gradient-to-t from-purple-100 to-purple-200 rounded-lg flex items-end p-2">
                      <Award className="w-4 h-4 text-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Star className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
              Comprehensive School Management
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 animate-fade-in">
              Everything Your School Needs in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto animate-fade-in">
              From CBC-compliant grading to M-Pesa fee collection, EduFam provides all the tools 
              Kenyan schools need to thrive in the digital age.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg cursor-pointer bg-gradient-to-br from-white to-gray-50 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => handleLearnMore(feature.title)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg animate-pulse`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{feature.description}</p>
                  <div className="space-y-1">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-xs text-green-700">
                        <CheckSquare className="w-3 h-3 mr-1" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-3">
                    <Button variant="ghost" className="text-blue-600 font-medium p-0 h-auto hover:text-blue-800 text-sm">
                      Learn more →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-green-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Leading Educational Technology in Kenya
            </h2>
            <p className="text-blue-200 text-lg animate-fade-in">
              Trusted by schools nationwide for excellence and innovation
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors group-hover:scale-110 transform duration-300">
                    <stat.icon className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-blue-200 font-medium mb-1">{stat.label}</div>
                <div className="text-blue-300 text-sm">{stat.description}</div>
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
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={handlePricing}>Pricing</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('CBC Integration: Full support for Kenya\'s Competency-Based Curriculum')}>CBC Support</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => alert('M-Pesa Integration: Seamless mobile money payments for school fees')}>M-Pesa Integration</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => window.open('https://docs.edufam.co.ke', '_blank')}>Documentation</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white transition-colors" onClick={() => window.open('https://help.edufam.co.ke', '_blank')}>Help Center</Button></li>
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
};

export default LandingPage;
