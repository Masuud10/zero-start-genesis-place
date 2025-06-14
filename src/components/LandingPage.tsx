
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
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const [showDemo, setShowDemo] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student information system with enrollment, attendance, and performance tracking.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BookOpen,
      title: "Grade Management",
      description: "Efficient grading system with automated calculations, report cards, and parent notifications.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Real-time insights into school performance, student progress, and administrative metrics.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control and data encryption.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your school management system anywhere, anytime on any device.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: GraduationCap,
      title: "AI-Powered",
      description: "Smart timetable generation, predictive analytics, and automated administrative tasks.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal, Green Valley High School",
      content: "Elimisha has transformed how we manage our school. The efficiency gains are remarkable.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "IT Director, City Academy",
      content: "The best school management system we've used. Intuitive, powerful, and reliable.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Prof. Maria Santos",
      role: "Dean, International School",
      content: "Our teachers and parents love the real-time communication features.",
      rating: 5,
      avatar: "MS"
    }
  ];

  const handleNavClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchDemo = () => {
    setShowDemo(true);
    // Simulate demo loading
    setTimeout(() => {
      setShowDemo(false);
      alert('Demo video would open here! Contact us to schedule a live demonstration.');
    }, 2000);
  };

  const handleContactSales = () => {
    window.open('mailto:sales@elimisha.com?subject=Sales Inquiry - School Management System&body=Hello, I am interested in learning more about Elimisha for my school. Please contact me to discuss pricing and features.', '_blank');
  };

  const handleContactUs = () => {
    window.open('mailto:contact@elimisha.com?subject=General Inquiry&body=Hello, I would like to know more about Elimisha school management system.', '_blank');
  };

  const handleGetStarted = () => {
    onLoginClick();
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/elimisha-demo', '_blank');
  };

  const handlePricing = () => {
    alert('Pricing information:\n\nStarter: $99/month (up to 100 students)\nProfessional: $199/month (up to 500 students)\nEnterprise: Custom pricing\n\nContact sales for detailed pricing and custom plans.');
  };

  const handleLearnMore = (featureTitle: string) => {
    alert(`Learn more about ${featureTitle}:\n\nThis feature provides comprehensive tools to help manage your school more effectively. Contact our sales team for a detailed demonstration of this functionality.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Elimisha
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200"
                onClick={() => handleNavClick('features')}
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200"
                onClick={handlePricing}
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200"
                onClick={() => handleNavClick('about')}
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex transition-all duration-200"
                onClick={handleContactUs}
              >
                Contact
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Trusted by 500+ schools worldwide
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-blue-900 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  School Management
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline operations, enhance communication, and empower educators with our 
                comprehensive school management system designed for the digital age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-105"
                >
                  Get Started Free
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
                  Schedule Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Free 30-day trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No setup fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  24/7 support
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-1 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-2 bg-gray-100 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-blue-200 rounded w-20"></div>
                      <div className="h-3 bg-blue-500 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-green-200 rounded w-16"></div>
                      <div className="h-3 bg-green-500 rounded w-8"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-purple-200 rounded w-24"></div>
                      <div className="h-3 bg-purple-500 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gradient-to-t from-blue-100 to-blue-200 rounded-lg flex items-end p-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="h-16 bg-gradient-to-t from-green-100 to-green-200 rounded-lg flex items-end p-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="h-16 bg-gradient-to-t from-purple-100 to-purple-200 rounded-lg flex items-end p-2">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Everything You Need to Manage Your School
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From student enrollment to graduation, Elimisha provides comprehensive tools 
              to streamline every aspect of school administration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg cursor-pointer bg-gradient-to-br from-white to-gray-50"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleLearnMore(feature.title)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="ghost" className="text-blue-600 font-medium p-0 h-auto hover:text-blue-800">
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
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Educational Leaders Worldwide
            </h2>
            <p className="text-blue-200 text-lg">
              Join the growing community of schools using Elimisha
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Schools Served", icon: Globe },
              { number: "50K+", label: "Students Managed", icon: Users },
              { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
              { number: "24/7", label: "Expert Support", icon: Clock }
            ].map((stat, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => alert(`${stat.label}: ${stat.number}\n\nThis represents our commitment to excellence in educational technology.`)}>
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              What Educators Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from real schools using Elimisha
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            Start Your Free Trial Today
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-blue-200 mb-8 leading-relaxed">
            Join thousands of schools already using Elimisha to streamline their operations and improve educational outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group text-lg px-8 py-4"
            >
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
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Full feature access
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Setup in minutes
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
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-900" />
                </div>
                <span className="text-2xl font-bold">Elimisha</span>
              </div>
              <p className="text-blue-200 mb-6 leading-relaxed">
                Empowering education through intelligent school management solutions. 
                Transform the way your school operates with our comprehensive platform.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3"
                  onClick={() => window.open('mailto:contact@elimisha.com', '_blank')}
                >
                  <Mail className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3"
                  onClick={() => window.open('tel:+1234567890', '_blank')}
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-200 hover:text-white hover:bg-blue-800 p-3"
                  onClick={() => alert('Visit us at: 123 Education Street, Tech City, TC 12345')}
                >
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => handleNavClick('features')}>Features</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={handlePricing}>Pricing</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Security: Enterprise-grade encryption, GDPR compliant, SOC 2 certified')}>Security</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Integrations: 100+ integrations with popular educational tools')}>Integrations</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => window.open('https://docs.elimisha.com', '_blank')}>Documentation</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => window.open('https://help.elimisha.com', '_blank')}>Help Center</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={handleContactUs}>Contact Us</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Training: Free onboarding, video tutorials, and live training sessions available')}>Training</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => handleNavClick('about')}>About</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Careers: Join our mission to transform education. Multiple positions available!')}>Careers</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Privacy Policy: We protect your data with industry-leading security measures')}>Privacy</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Terms of Service: Fair and transparent terms for educational institutions')}>Terms</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 mb-4 md:mb-0">&copy; 2024 Elimisha. All rights reserved.</p>
            <div className="flex space-x-6 text-blue-200 text-sm">
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Status: All systems operational')}>
                System Status
              </Button>
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('API: Developer-friendly REST API available')}>
                API
              </Button>
              <Button variant="link" className="text-blue-200 p-0 h-auto hover:text-white" onClick={() => alert('Partners: Join our partner program for exclusive benefits')}>
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
