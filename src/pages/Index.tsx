import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto gradient-navy rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <p className="text-muted-foreground">Loading EduFam school management system...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-navy rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📈</span>
                </div>
                <h2 className="text-2xl font-semibold">Advanced Analytics</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Comprehensive analytics dashboard with real-time insights, performance tracking, 
                  and detailed reporting for data-driven decision making.
                </p>
              </div>
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Grade Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-navy rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📝</span>
                </div>
                <h2 className="text-2xl font-semibold">Secure Grading System</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Excel-like interface for bulk grade entry, immutable records, 
                  admin approval workflows, and automated position calculations.
                </p>
              </div>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-success rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📅</span>
                </div>
                <h2 className="text-2xl font-semibold">Smart Attendance Tracking</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Bulk entry, morning/afternoon sessions, analytics, and comprehensive reporting.
                </p>
              </div>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Finance Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">💰</span>
                </div>
                <h2 className="text-2xl font-semibold">MPESA-Integrated Finance</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Automated fee collection, expense tracking, real-time analytics, and audit-ready reports.
                </p>
              </div>
            </div>
          </div>
        );
      case 'timetable':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Timetable Generator
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">🗓️</span>
                </div>
                <h2 className="text-2xl font-semibold">Smart Scheduling</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Automated timetable generation with conflict resolution and multi-format exports.
                </p>
              </div>
            </div>
          </div>
        );
      case 'announcements':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Announcements
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📢</span>
                </div>
                <h2 className="text-2xl font-semibold">Communication Hub</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Broadcast announcements with read tracking, file attachments, and audience targeting.
                </p>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Messages
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">💬</span>
                </div>
                <h2 className="text-2xl font-semibold">Secure Messaging</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Real-time communication between parents, teachers, and administrators.
                </p>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Support Center
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">🎧</span>
                </div>
                <h2 className="text-2xl font-semibold">Help & Support</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Submit tickets, track issues, and get help from the EduFam support team.
                </p>
              </div>
            </div>
          </div>
        );
      case 'students':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-warning rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">👥</span>
                </div>
                <h2 className="text-2xl font-semibold">Student Records</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete student information management with enrollment, 
                  class assignments, and parent connections.
                </p>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📈</span>
                </div>
                <h2 className="text-2xl font-semibold">Academic Reports</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Comprehensive reporting system with performance analytics, 
                  trend analysis, and exportable formats.
                </p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Settings
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">⚙️</span>
                </div>
                <h2 className="text-2xl font-semibold">Administrative Settings</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  System configuration, user management, and security settings 
                  for administrators.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Layout>
          {renderContent()}
        </Layout>
      </div>
    </div>
  );
};

export default Index;
