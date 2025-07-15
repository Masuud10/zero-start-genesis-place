import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface PendingGrade {
  id: string;
  studentName: string;
  subject: string;
  grade: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const GradesManagementPage: React.FC = () => {
  const [pendingGrades] = useState<PendingGrade[]>([
    {
      id: '1',
      studentName: 'John Doe',
      subject: 'Mathematics',
      grade: 'A',
      submittedBy: 'Mrs. Smith',
      submittedAt: '2024-01-15',
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      subject: 'English',
      grade: 'B+',
      submittedBy: 'Mr. Johnson',
      submittedAt: '2024-01-14',
      status: 'pending'
    }
  ]);

  const handleApprove = (gradeId: string) => {
    console.log('Approving grade:', gradeId);
  };

  const handleReject = (gradeId: string) => {
    console.log('Rejecting grade:', gradeId);
  };

  const handleOverride = (gradeId: string) => {
    console.log('Overriding grade:', gradeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grade Approval Queue</h1>
          <p className="text-muted-foreground">Review and approve submitted grades from teachers</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGrades.filter(g => g.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Grades approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Grades rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Grade Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingGrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No grades pending approval</p>
              <p>Teachers will submit grades for approval here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingGrades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{grade.studentName}</p>
                        <p className="text-sm text-muted-foreground">{grade.subject}</p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        Grade: {grade.grade}
                      </Badge>
                      <Badge variant="secondary">
                        {grade.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Submitted by {grade.submittedBy} on {grade.submittedAt}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(grade.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(grade.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOverride(grade.id)}
                    >
                      Override
                    </Button>
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

export default GradesManagementPage;