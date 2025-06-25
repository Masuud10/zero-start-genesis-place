
import React from "react";
import { GraduationCap, Mail, Phone, MapPin, Heart } from "lucide-react";

interface FooterProps {
  onNavClick: (section: string) => void;
  onPricing: () => void;
  onScheduleDemo: () => void;
}

const Footer = ({ onNavClick, onPricing, onScheduleDemo }: FooterProps) => {
  return (
    <footer className="bg-slate-900 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-emerald-900/50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">EduFam</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              Empowering Kenyan schools with comprehensive management solutions
              designed for the modern educational landscape.
            </p>
            <div className="flex items-center text-slate-400">
              <span className="text-sm">Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-400 fill-current" />
              <span className="text-sm">in Kenya</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <button
                  onClick={() => onNavClick("features")}
                  className="hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={onPricing}
                  className="hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={onScheduleDemo}
                  className="hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Demo
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300 text-sm font-medium">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <button
                  onClick={() => onNavClick("about")}
                  className="hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick("contact")}
                  className="hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Contact
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300 text-sm font-medium">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300 text-sm font-medium">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Contact</h4>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-center group">
                <Mail className="w-4 h-4 mr-3 group-hover:text-blue-400 transition-colors duration-300" />
                <span className="text-sm font-medium">info@edufam.org</span>
              </div>
              <div className="flex items-center group">
                <Phone className="w-4 h-4 mr-3 group-hover:text-emerald-400 transition-colors duration-300" />
                <span className="text-sm font-medium">+254708066322</span>
              </div>
              <div className="flex items-center group">
                <MapPin className="w-4 h-4 mr-3 group-hover:text-purple-400 transition-colors duration-300" />
                <span className="text-sm font-medium">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; 2025 EduFam. All rights reserved. Proudly serving Kenyan schools.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
