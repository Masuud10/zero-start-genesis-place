
import React from 'react';
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
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student information system with enrollment, attendance, and performance tracking."
    },
    {
      icon: BookOpen,
      title: "Grade Management",
      description: "Efficient grading system with automated calculations, report cards, and parent notifications."
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Real-time insights into school performance, student progress, and administrative metrics."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control and data encryption."
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your school management system anywhere, anytime on any device."
    },
    {
      icon: GraduationCap,
      title: "AI-Powered",
      description: "Smart timetable generation, predictive analytics, and automated administrative tasks."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal, Green Valley High School",
      content: "Elimisha has transformed how we manage our school. The efficiency gains are remarkable.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "IT Director, City Academy",
      content: "The best school management system we've used. Intuitive, powerful, and reliable.",
      rating: 5
    },
    {
      name: "Prof. Maria Santos",
      role: "Dean, International School",
      content: "Our teachers and parents love the real-time communication features.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Elimisha
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex"
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex"
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:bg-blue-50 hidden md:inline-flex"
              >
                Contact
              </Button>
              <Button 
                onClick={onLoginClick}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-blue-900 leading-tight">
                Transform Your School
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline operations, enhance communication, and empower educators with our 
                comprehensive school management system designed for the digital age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onLoginClick}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-blue-300 text-blue-900 hover:bg-blue-50"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-blue-200 rounded w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-blue-100 rounded-lg"></div>
                    <div className="h-16 bg-green-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
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
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-blue-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Schools Served" },
              { number: "50K+", label: "Students Managed" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what school administrators are saying about Elimisha
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-blue-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of schools already using Elimisha to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onLoginClick}
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-900"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-900" />
                </div>
                <span className="text-xl font-bold">Elimisha</span>
              </div>
              <p className="text-blue-200">
                Empowering education through intelligent school management solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Features</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Pricing</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Security</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Documentation</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Help Center</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Contact Us</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">About</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Careers</Button></li>
                <li><Button variant="link" className="text-blue-200 p-0 h-auto">Privacy</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2024 Elimisha. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
