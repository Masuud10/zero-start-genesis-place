import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import GradesModal from './modals/GradesModal';
import AttendanceModal from './modals/AttendanceModal';
import ResultsModal from './modals/ResultsModal';
import ReportsModal from './modals/ReportsModal';
import FeeCollectionModal from './modals/FeeCollectionModal';
import FinancialReportsModal from './modals/FinancialReportsModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: "👥",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Average Grade",
      value: "85.4%",
      change: "+2.3%",
      icon: "📊",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+1.1%",
      icon: "📅",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Active Teachers",
      value: "48",
      change: "+3",
      icon: "👨‍🏫",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const recentActivities = [
    {
      action: "Grade submitted for Math Class 10A",
      user: "Ms. Johnson",
      time: "2 minutes ago",
      type: "grade"
    },
    {
      action: "Attendance marked for Science Class 9B",
      user: "Mr. Smith",
      time: "15 minutes ago",
      type: "attendance"
    },
    {
      action: "Results released for Term 1 Examinations",
      user: "Principal",
      time: "1 hour ago",
      type: "admin"
    },
    {
      action: "New student enrolled in Class 8C",
      user: "Principal",
      time: "2 hours ago",
      type: "student"
    }
  ];

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Here's what's happening in your school today.
          </p>
        </div>
        <div className="block">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg">
            <div className="text-xs md:text-sm opacity-90">Today's Date</div>
            <div className="font-semibold text-sm md:text-base">
              {new Date().toLocaleDateString('en-US', { 
                weekday: window.innerWidth < 768 ? 'short' : 'long', 
                year: 'numeric', 
                month: window.innerWidth < 768 ? 'short' : 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="text-xl md:text-2xl">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
            <span>📋</span>
            <span>Recent Activities</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Latest updates from the Elimisha school management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 md:p-3 rounded-lg hover:bg-accent transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'grade' ? 'bg-blue-500' :
                  activity.type === 'attendance' ? 'bg-green-500' :
                  activity.type === 'admin' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 gap-1">
                    <p className="text-xs text-muted-foreground">
                      by {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
            <span>⚡</span>
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Frequently used features for efficient workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:gap-3">
            {user?.role === 'teacher' && (
              <>
                <button 
                  onClick={() => openModal('grades')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">📝</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Submit Grades</p>
                    <p className="text-xs text-muted-foreground">Upload and manage student grades</p>
                  </div>
                </button>
                <button 
                  onClick={() => openModal('attendance')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">📅</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Mark Attendance</p>
                    <p className="text-xs text-muted-foreground">Record daily attendance</p>
                  </div>
                </button>
              </>
            )}
            {(user?.role === 'school_owner' || user?.role === 'principal' || user?.role === 'edufam_admin') && (
              <>
                <button 
                  onClick={() => openModal('results')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">🔓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Release Results</p>
                    <p className="text-xs text-muted-foreground">Publish grades to parents</p>
                  </div>
                </button>
                <button 
                  onClick={() => openModal('reports')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Generate Reports</p>
                    <p className="text-xs text-muted-foreground">Academic performance reports</p>
                  </div>
                </button>
              </>
            )}
            {user?.role === 'parent' && (
              <>
                <button 
                  onClick={() => openModal('grades')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">👦</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">View Child's Grades</p>
                    <p className="text-xs text-muted-foreground">Academic performance tracking</p>
                  </div>
                </button>
                <button 
                  onClick={() => openModal('attendance')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">📅</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Attendance Report</p>
                    <p className="text-xs text-muted-foreground">Daily attendance overview</p>
                  </div>
                </button>
              </>
            )}
            {user?.role === 'finance_officer' && (
              <>
                <button 
                  onClick={() => openModal('fee-collection')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Fee Collection</p>
                    <p className="text-xs text-muted-foreground">Manage student fees and payments</p>
                  </div>
                </button>
                <button 
                  onClick={() => openModal('financial-reports')}
                  className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left w-full"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">Financial Reports</p>
                    <p className="text-xs text-muted-foreground">Generate finance analytics</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {activeModal === 'grades' && <GradesModal onClose={closeModal} userRole={user?.role} />}
      {activeModal === 'attendance' && <AttendanceModal onClose={closeModal} userRole={user?.role} />}
      {activeModal === 'results' && <ResultsModal onClose={closeModal} />}
      {activeModal === 'reports' && <ReportsModal onClose={closeModal} />}
      {activeModal === 'fee-collection' && <FeeCollectionModal onClose={closeModal} />}
      {activeModal === 'financial-reports' && <FinancialReportsModal onClose={closeModal} />}
    </div>
  );
};

export default Dashboard;
