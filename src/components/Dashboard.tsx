
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

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
      user: "Admin",
      time: "1 hour ago",
      type: "admin"
    },
    {
      action: "New student enrolled in Class 8C",
      user: "Admin",
      time: "2 hours ago",
      type: "student"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your school today.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-lg">
            <div className="text-sm opacity-90">Today's Date</div>
            <div className="font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="text-2xl">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>
              Latest updates from the school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
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
                    <div className="flex items-center justify-between mt-1">
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
            <CardTitle className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Frequently used features for efficient workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {user?.role === 'teacher' && (
                <>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    <div>
                      <p className="font-medium">Submit Grades</p>
                      <p className="text-xs text-muted-foreground">Upload and manage student grades</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                    <div>
                      <p className="font-medium">Mark Attendance</p>
                      <p className="text-xs text-muted-foreground">Record daily attendance</p>
                    </div>
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🔓</span>
                    </div>
                    <div>
                      <p className="font-medium">Release Results</p>
                      <p className="text-xs text-muted-foreground">Publish grades to parents</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <div>
                      <p className="font-medium">Generate Reports</p>
                      <p className="text-xs text-muted-foreground">Academic performance reports</p>
                    </div>
                  </button>
                </>
              )}
              {user?.role === 'parent' && (
                <>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">👦</span>
                    </div>
                    <div>
                      <p className="font-medium">View Child's Grades</p>
                      <p className="text-xs text-muted-foreground">Academic performance tracking</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-left">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                    <div>
                      <p className="font-medium">Attendance Report</p>
                      <p className="text-xs text-muted-foreground">Daily attendance overview</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
