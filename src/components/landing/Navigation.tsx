
import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';

interface NavigationProps {
  onNavClick: (section: string) => void;
  onGetStarted: () => void;
  onPricing: () => void;
}

const Navigation = ({ onNavClick, onGetStarted, onPricing }: NavigationProps) => {
  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group cursor-pointer" onClick={() => onNavClick('home')}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                EduFam
              </span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => onNavClick('home')}
                className="text-slate-900 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-colors duration-300 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button 
                onClick={() => onNavClick('features')}
                className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-colors duration-300 relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button 
                onClick={() => onNavClick('about')}
                className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-colors duration-300 relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button 
                onClick={() => onNavClick('contact')}
                className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-colors duration-300 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button 
                onClick={onPricing}
                className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-colors duration-300 relative group"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onGetStarted}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-semibold transition-all duration-300"
            >
              Sign In
            </Button>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold rounded-xl"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
