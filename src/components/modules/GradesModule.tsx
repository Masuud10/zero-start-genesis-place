
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import GradesAdminSummary from './GradesAdminSummary';
import ParentGradesView from '../grades/ParentGradesView';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import BulkGradingModal from '../grading/BulkGradingModal';
import NoGradebookPermission from '../grades/NoGradebookPermission';
import BulkGradingQuickAction from '../dashboard/principal/BulkGradingQuickAction';

const GradesModule: React.FC = () => {
  const { user } = useAuth();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [gradesSummary, setGradesSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  // Caching and optimization refs
  const dataFetchedRef = useRef(false);
  const summaryCache = useRef<Map<string, any>>(new Map());
  const schoolsCache = useRef<{ id: string; name: string }[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  // Memoize role check to avoid recalculation
  const isSummaryRole = useMemo(() => {
    return user?.role && ['edufam_admin', 'principal', 'school_owner'].includes(user.role);
  }, [user?.role]);

  // Optimized data fetching with proper async/await
  const fetchGradesData = async () => {
    if (!isSummaryRole || !user) {
      setLoadingSummary(false);
      return;
    }

    const now = Date.now();
    const effectiveSchoolId = user.role === 'edufam_admin' ? schoolFilter : user.school_id;
    const cacheKey = `${user.role}_${effectiveSchoolId || 'all'}`;

    // Check cache first
    if (summaryCache.current.has(cacheKey) && (now - lastFetchTime.current) < CACHE_DURATION) {
      console.log('🎓 GradesModule: Using cached data for', cacheKey);
      const cachedData = summaryCache.current.get(cacheKey);
      setGradesSummary(cachedData.summary);
      setSchools(cachedData.schools);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    setErrorSummary(null);

    try {
      console.log('🎓 GradesModule: Fetching fresh data for', cacheKey);

      let schoolsData = schoolsCache.current;
      let summaryData = null;

      // Fetch schools if admin and not cached - FIX: Properly await the query
      if (user.role === 'edufam_admin' && schoolsCache.current.length === 0) {
        const { data: schoolsResponse, error: schoolsError } = await supabase
          .from("schools")
          .select("id, name")
          .order('name');
          
        if (schoolsError) {
          console.error('🚫 Schools fetch error:', schoolsError);
          throw new Error("Failed to fetch schools list.");
        }
        schoolsData = schoolsResponse || [];
        schoolsCache.current = schoolsData; // Cache schools
      }

      // Fetch grades summary if school is selected - FIX: Properly await the query
      if (effectiveSchoolId) {
        const { data: summaryResponse, error: summaryError } = await supabase
          .from("school_grades_summary")
          .select("*")
          .eq("school_id", effectiveSchoolId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data
          
        if (summaryError) {
          console.error('🚫 Grades summary fetch error:', summaryError);
          throw new Error("Could not load grades summary data.");
        }
        summaryData = summaryResponse;
      }

      // Cache the results
      summaryCache.current.set(cacheKey, {
        summary: summaryData,
        schools: schoolsData
      });
      lastFetchTime.current = now;

      setSchools(schoolsData);
      setGradesSummary(summaryData);

    } catch (error: any) {
      console.error('🎓 GradesModule: Error fetching data:', error);
      setErrorSummary(error.message || "Failed to load grades data.");
      setGradesSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Only fetch data when dependencies change and avoid duplicate calls
  useEffect(() => {
    if (!user || dataFetchedRef.current) return;
    
    dataFetchedRef.current = true;
    fetchGradesData();
  }, [isSummaryRole, user?.role, user?.school_id]);

  // Handle school filter changes (only for admins)
  useEffect(() => {
    if (user?.role === 'edufam_admin' && dataFetchedRef.current) {
      fetchGradesData();
    }
  }, [schoolFilter]);

  // Reset data fetch flag when user changes
  useEffect(() => {
    dataFetchedRef.current = false;
    summaryCache.current.clear();
    lastFetchTime.current = 0;
  }, [user?.id]);

  const renderForSummaryRole = () => {
    if (loadingSummary) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (errorSummary) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{errorSummary}</AlertDescription>
        </Alert>
      );
    }
    if (user?.role === 'edufam_admin' && !schoolFilter && schools.length > 0) {
        return <GradesAdminSummary schools={schools} schoolFilter={schoolFilter} setSchoolFilter={setSchoolFilter} gradesSummary={null} loading={false} error={null} />;
    }
    if (!gradesSummary) {
      const message = user?.role === 'edufam_admin' && schools.length === 0
        ? "No schools found."
        : "There is no grades summary available for this school.";
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return (
      <GradesAdminSummary
        loading={loadingSummary}
        error={null}
        gradesSummary={{
          avg_grade: gradesSummary.average_grade ?? null,
          most_improved_school: '—',
          declining_alerts: 0
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  };
  
  if (!user) return <div>Loading...</div>;

  if (user.role !== 'parent' && !hasPermission('view_gradebook')) {
      return <NoGradebookPermission role={user.role} hasPermission={false} />;
  }

  switch (user.role) {
    case 'edufam_admin':
    case 'school_owner':
      return renderForSummaryRole();
    case 'principal':
        return (
            <div className="space-y-6">
                {renderForSummaryRole()}
                <div className="pt-6 border-t">
                  <BulkGradingQuickAction onOpenBulkGrade={() => setShowBulkModal(true)} />
                </div>
                {showBulkModal && (
                  <BulkGradingModal 
                    open={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    classList={[]}
                    subjectList={[]}
                  />
                )}
            </div>
        );
    case 'teacher':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grade Management
              </h1>
              <p className="text-muted-foreground">
                Enter and manage student grades for your classes.
              </p>
            </div>
          </div>
          
          <BulkGradingQuickAction onOpenBulkGrade={() => setShowBulkModal(true)} />

          {showBulkModal && (
            <BulkGradingModal 
              open={showBulkModal}
              onClose={() => setShowBulkModal(false)}
              classList={[]}
              subjectList={[]}
            />
          )}
        </div>
      );
    case 'parent':
      return <ParentGradesView />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
          <p className="text-gray-500">Your role ({user.role}) does not have access to the grades module.</p>
        </div>
      );
  }
};

export default GradesModule;
