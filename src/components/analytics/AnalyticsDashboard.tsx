
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { DownloadIcon, FilterIcon } from 'lucide-react';
import SchoolOwnerAnalytics from './SchoolOwnerAnalytics';
import PrincipalAnalytics from './PrincipalAnalytics';
import TeacherAnalytics from './TeacherAnalytics';
import FinanceOfficerAnalytics from './FinanceOfficerAnalytics';
import ParentAnalytics from './ParentAnalytics';
import EduFamAdminAnalytics from './EduFamAdminAnalytics';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting analytics in ${format} format`);
    // Export logic would be implemented here
  };

  const renderAnalytics = () => {
    switch (user?.role) {
      case 'school_owner':
        return <SchoolOwnerAnalytics filters={{ term: selectedTerm, class: selectedClass }} />;
      case 'principal':
        return <PrincipalAnalytics filters={{ term: selectedTerm, class: selectedClass, subject: selectedSubject }} />;
      case 'teacher':
        return <TeacherAnalytics filters={{ term: selectedTerm, class: selectedClass, subject: selectedSubject }} />;
      case 'finance_officer':
        return <FinanceOfficerAnalytics filters={{ term: selectedTerm, class: selectedClass }} />;
      case 'parent':
        return <ParentAnalytics filters={{ term: selectedTerm }} />;
      case 'edufam_admin':
        return <EduFamAdminAnalytics filters={{ term: selectedTerm }} />;
      default:
        return <div>Access denied</div>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and data analytics for {user?.role?.replace('_', ' ')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Term</SelectItem>
                  <SelectItem value="term-1">Term 1 - 2024</SelectItem>
                  <SelectItem value="term-2">Term 2 - 2024</SelectItem>
                  <SelectItem value="term-3">Term 3 - 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(user?.role === 'principal' || user?.role === 'teacher') && (
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="grade-1a">Grade 1A</SelectItem>
                    <SelectItem value="grade-1b">Grade 1B</SelectItem>
                    <SelectItem value="grade-2a">Grade 2A</SelectItem>
                    <SelectItem value="grade-2b">Grade 2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(user?.role === 'principal' || user?.role === 'teacher') && (
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content */}
      {renderAnalytics()}
    </div>
  );
};

export default AnalyticsDashboard;
