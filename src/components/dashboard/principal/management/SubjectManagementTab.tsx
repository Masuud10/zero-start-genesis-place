
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import NewSubjectCreationModal from '@/components/subjects/NewSubjectCreationModal';
import SubjectsList from '@/components/subjects/SubjectsList';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SubjectManagementTab = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  
  // Fetch subjects using existing hook
  const { subjects, loading: subjectsLoading, error: subjectsError, retry } = useSubjects();
  
  // Fetch classes and teachers for the form
  const { 
    classList, 
    teacherList, 
    isLoading: entitiesLoading,
    errorEntities 
  } = usePrincipalEntityLists(reloadKey);

  const handleCreateSuccess = () => {
    console.log('✅ Subject created successfully, refreshing data...');
    
    // Force reload of all data
    setReloadKey(prev => prev + 1);
    retry(); // Refresh subjects list
    
    // Close modal
    setShowCreateModal(false);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying data fetch...');
    setReloadKey(prev => prev + 1);
    retry();
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered...');
    setReloadKey(prev => prev + 1);
    retry();
  };

  if (subjectsError || errorEntities) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {subjectsError || errorEntities}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Creation Interface */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Subject Management</CardTitle>
                <p className="text-blue-600 text-sm">
                  Create and manage subjects for your school
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Subject
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={subjectsLoading || entitiesLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${subjectsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {subjectsLoading ? '...' : subjects.length}
                </p>
                <p className="text-xs text-gray-600">Total Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {subjectsLoading ? '...' : subjects.filter(s => s.curriculum?.toUpperCase() === 'CBC').length}
                </p>
                <p className="text-xs text-gray-600">CBC Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {subjectsLoading ? '...' : subjects.filter(s => s.curriculum?.toUpperCase() === 'IGCSE').length}
                </p>
                <p className="text-xs text-gray-600">IGCSE Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {subjectsLoading ? '...' : subjects.filter(s => s.is_active).length}
                </p>
                <p className="text-xs text-gray-600">Active Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            All Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectsList 
            subjects={subjects} 
            loading={subjectsLoading}
          />
        </CardContent>
      </Card>

      {/* Subject Creation Modal */}
      {showCreateModal && (
        <NewSubjectCreationModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          classes={classList || []}
          teachers={teacherList || []}
        />
      )}
    </div>
  );
};

export default SubjectManagementTab;
