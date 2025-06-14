
import React, { useState } from 'react';
import Navigation from './landing/Navigation';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import TestimonialsSection from './landing/TestimonialsSection';
import RevolutionSection from './landing/RevolutionSection';
import Footer from './landing/Footer';
import VideoModal from './landing/VideoModal';
import PricingPage from './landing/PricingPage';
import AboutPage from '@/components/pages/AboutPage';
import FeaturesPage from '@/components/pages/FeaturesPage';
import ContactPage from '@/components/pages/ContactPage';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen">
      <Navigation 
        onNavClick={handleNavClick}
        onGetStarted={handleGetStarted}
        onPricing={handlePricing}
      />
      
      <HeroSection 
        onGetStarted={handleGetStarted}
        onWatchDemo={handleWatchDemo}
      />
      
      <FeaturesSection />
      
      <TestimonialsSection />
      
      <RevolutionSection 
        onGetStarted={handleGetStarted}
        onContactSales={handleContactSales}
        onScheduleDemo={handleScheduleDemo}
      />
      
      <Footer 
        onNavClick={handleNavClick}
        onPricing={handlePricing}
        onScheduleDemo={handleScheduleDemo}
      />
    </div>
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
        return <PricingPage onBackToHome={handleBackToHome} onContactSales={handleContactSales} onScheduleDemo={handleScheduleDemo} />;
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
      <VideoModal isOpen={showVideoModal} onClose={handleCloseVideoModal} />
    </>
  );
};

export default LandingPage;
