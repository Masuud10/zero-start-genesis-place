
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Eye, Edit, Filter } from 'lucide-react';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { useToast } from '@/hooks/use-toast';

export const PrincipalGradeApprovalInterface: React.FC = () => {
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  } = usePrincipalGradeManagement();

  const { toast } = useToast();
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const filteredGrades = grades?.filter(grade => {
    if (filterStatus !== 'all' && grade.status !== filterStatus) return false;
    if (filterClass !== 'all' && grade.class_id !== filterClass) return false;
    if (filterSubject !== 'all' && grade.subject_id !== filterSubject) return false;
    return true;
  }) || [];

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGrades.length === filteredGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(filteredGrades.map(g => g.id));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'release') => {
    if (selectedGrades.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select grades to perform this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (action) {
        case 'approve':
          await handleApproveGrades(selectedGrades);
          break;
        case 'reject':
          await handleRejectGrades(selectedGrades);
          break;
        case 'release':
          await handleReleaseGrades(selectedGrades);
          break;
      }
      setSelectedGrades([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      released: 'bg-blue-100 text-blue-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading grades...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {/* Add dynamic class options here */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {/* Add dynamic subject options here */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedGrades.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedGrades.length} grade{selectedGrades.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={processing === 'approve'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  disabled={processing === 'reject'}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Selected
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('release')}
                  disabled={processing === 'release'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Release Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Grade Details</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
            >
              {selectedGrades.length === filteredGrades.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grades found matching the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map((grade) => (
                <div
                  key={grade.id}
                  className={`p-4 border rounded-lg ${
                    selectedGrades.includes(grade.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGrades.includes(grade.id)}
                        onChange={() => handleSelectGrade(grade.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <h4 className="font-medium">
                          {grade.students?.name || 'Unknown Student'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {grade.classes?.name} - {grade.subjects?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {grade.term} {grade.exam_type} • Score: {grade.score}/{grade.max_score}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(grade.status)}>
                        {grade.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(grade.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
