
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Users, TrendingUp, Clock, Upload, Download, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceModal from '@/components/modals/AttendanceModal';

const AttendanceModule = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const attendanceStats = [
    { title: "Present Today", value: "235", icon: CalendarCheck, color: "bg-green-100", iconColor: "text-green-600" },
    { title: "Absent Today", value: "15", icon: Users, color: "bg-red-100", iconColor: "text-red-600" },
    { title: "Attendance Rate", value: "94%", icon: TrendingUp, color: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Late Arrivals", value: "8", icon: Clock, color: "bg-orange-100", iconColor: "text-orange-600" },
  ];

  const quickActions = [
    { 
      title: "Mark Attendance", 
      description: "Record daily attendance", 
      icon: CalendarCheck, 
      action: () => setActiveModal('attendance'),
      roles: ['teacher', 'principal', 'school_owner']
    },
    { 
      title: "View Attendance", 
      description: "Check attendance records", 
      icon: Calendar, 
      action: () => setActiveModal('attendance'),
      roles: ['parent', 'student']
    },
    { 
      title: "Bulk Entry", 
      description: "Mark attendance for entire class", 
      icon: Upload, 
      action: () => setActiveModal('bulk-attendance'),
      roles: ['teacher', 'principal', 'school_owner']
    },
    { 
      title: "Generate Reports", 
      description: "Create attendance reports", 
      icon: Download, 
      action: () => setActiveModal('reports'),
      roles: ['teacher', 'principal', 'school_owner']
    }
  ];

  const userRole = user?.role || '';
  const filteredActions = quickActions.filter(action => action.roles.includes(userRole));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Attendance Management
        </h1>
        <p className="text-muted-foreground">Track and manage student attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {attendanceStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex items-center justify-start gap-4 p-4"
                onClick={action.action}
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Management Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Daily Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Mark attendance for morning and afternoon sessions with real-time updates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate attendance reports and track trends over time with insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Bulk Entry</h3>
              <p className="text-sm text-muted-foreground">
                Efficiently mark attendance for entire classes at once with validation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeModal === 'attendance' && (
        <AttendanceModal 
          onClose={() => setActiveModal(null)} 
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default AttendanceModule;
