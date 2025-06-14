
import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavClick: (section: string) => void;
  onPricing: () => void;
  onScheduleDemo: () => void;
}

const Footer = ({ onNavClick, onPricing, onScheduleDemo }: FooterProps) => {
  return (
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
              <li><button onClick={() => onNavClick('features')} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={onPricing} className="hover:text-white transition-colors">Pricing</button></li>
              <li><button onClick={onScheduleDemo} className="hover:text-white transition-colors">Demo</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => onNavClick('about')} className="hover:text-white transition-colors">About</button></li>
              <li><button onClick={() => onNavClick('contact')} className="hover:text-white transition-colors">Contact</button></li>
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
  );
};

export default Footer;
