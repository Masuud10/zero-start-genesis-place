
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Award, BarChart3, Upload, Download, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GradesModal from '@/components/modals/GradesModal';

const GradesModule = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const gradeStats = [
    { title: "Total Subjects", value: "15", icon: BookOpen, color: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Average Grade", value: "B+", icon: TrendingUp, color: "bg-green-100", iconColor: "text-green-600" },
    { title: "Top Performers", value: "45", icon: Award, color: "bg-orange-100", iconColor: "text-orange-600" },
    { title: "Exams Graded", value: "125", icon: BarChart3, color: "bg-purple-100", iconColor: "text-purple-600" },
  ];

  const quickActions = [
    { 
      title: "Submit Grades", 
      description: "Upload and manage student grades", 
      icon: Upload, 
      action: () => setActiveModal('grades'),
      roles: ['teacher', 'principal', 'school_owner']
    },
    { 
      title: "View Grades", 
      description: "View student performance", 
      icon: BarChart3, 
      action: () => setActiveModal('grades'),
      roles: ['parent', 'student']
    },
    { 
      title: "Generate Reports", 
      description: "Create grade reports", 
      icon: Download, 
      action: () => setActiveModal('reports'),
      roles: ['teacher', 'principal', 'school_owner']
    },
    { 
      title: "Class Overview", 
      description: "View class performance", 
      icon: Users, 
      action: () => setActiveModal('class-overview'),
      roles: ['teacher', 'principal', 'school_owner']
    }
  ];

  const userRole = user?.role || '';
  const filteredActions = quickActions.filter(action => action.roles.includes(userRole));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Grade Management
        </h1>
        <p className="text-muted-foreground">Manage academic grades and assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gradeStats.map((stat, index) => (
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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-blue-600" />
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
          <CardTitle>Grading System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Bulk Grade Entry</h3>
              <p className="text-sm text-muted-foreground">
                Excel-like interface for efficient bulk grade entry and management
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Position Calculation</h3>
              <p className="text-sm text-muted-foreground">
                Automatic calculation of class positions and ranking
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Grade Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics and performance tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeModal === 'grades' && (
        <GradesModal 
          onClose={() => setActiveModal(null)} 
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default GradesModule;
