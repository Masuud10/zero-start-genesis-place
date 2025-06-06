
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto gradient-academic rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <p className="text-muted-foreground">Loading school management system...</p>
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
      case 'grades':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Grade Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-academic rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📝</span>
                </div>
                <h2 className="text-2xl font-semibold">Grades Module</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Secure grade management with Excel-like interface, bulk upload capabilities, 
                  immutable records, and admin approval workflows for grade modifications.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🚧 This module is being built with advanced features including:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Excel-like bulk grade entry interface</li>
                    <li>• Immutable grade records with audit trails</li>
                    <li>• Admin approval for grade modifications</li>
                    <li>• Automatic calculation of totals and positions</li>
                    <li>• Release toggle for parent visibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border-0">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto gradient-success rounded-2xl flex items-center justify-center">
                  <span className="text-3xl text-white">📅</span>
                </div>
                <h2 className="text-2xl font-semibold">Attendance Module</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Comprehensive attendance tracking with bulk entry, session management, 
                  analytics, and detailed reporting capabilities.
                </p>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚧 This module includes advanced features:
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Morning/Afternoon session tracking</li>
                    <li>• Bulk class-level attendance entry</li>
                    <li>• Student remarks and behavioral notes</li>
                    <li>• Attendance analytics and trends</li>
                    <li>• Export capabilities (PDF, CSV, Excel)</li>
                  </ul>
                </div>
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
