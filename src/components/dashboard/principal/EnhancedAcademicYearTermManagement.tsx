import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Plus,
  Settings,
  CheckCircle,
  AlertTriangle,
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import AcademicYearModal from "@/components/modals/AcademicYearModal";
import AcademicTermModal from "@/components/modals/AcademicTermModal";
import { SystemIntegrationService } from "@/services/integration/SystemIntegrationService";

const EnhancedAcademicYearTermManagement = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Get current academic period
  const { data: currentPeriod, isLoading: loadingPeriod } = useQuery({
    queryKey: ["currentAcademicPeriod", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      return await SystemIntegrationService.getCurrentAcademicPeriod(schoolId);
    },
    enabled: !!schoolId,
  });

  // Fetch academic years with proper school isolation
  const { data: academicYears, isLoading: loadingYears } = useQuery({
    queryKey: ["academicYears", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("school_id", schoolId)
        .order("start_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch academic terms with proper school isolation
  const { data: academicTerms, isLoading: loadingTerms } = useQuery({
    queryKey: ["academicTerms", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("academic_terms")
        .select("*, academic_years(year_name)")
        .eq("school_id", schoolId)
        .order("start_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get class statistics for current period
  const { data: classStats, isLoading: loadingStats } = useQuery({
    queryKey: ["classStats", schoolId, currentPeriod?.year?.id],
    queryFn: async () => {
      if (!schoolId || !currentPeriod?.year?.id) return null;

      const { classes } = await SystemIntegrationService.getAvailableClasses(
        schoolId,
        currentPeriod.year.id
      );

      return {
        totalClasses: classes.length,
        activeClasses: classes.filter((c) => c.is_active).length,
        cbcClasses: classes.filter((c) => c.curriculum_type === "CBC").length,
        igcseClasses: classes.filter((c) => c.curriculum_type === "IGCSE")
          .length,
        standardClasses: classes.filter((c) => c.curriculum_type === "Standard")
          .length,
      };
    },
    enabled: !!schoolId && !!currentPeriod?.year?.id,
  });

  // Set current academic year
  const setCurrentYear = useMutation({
    mutationFn: async (yearId: string) => {
      if (!schoolId) throw new Error("No school ID");

      // First, unset all current years for this school
      await supabase
        .from("academic_years")
        .update({ is_current: false })
        .eq("school_id", schoolId);

      // Then set the selected year as current
      const { error } = await supabase
        .from("academic_years")
        .update({ is_current: true })
        .eq("id", yearId)
        .eq("school_id", schoolId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Current academic year updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["academicYears", schoolId] });
      queryClient.invalidateQueries({
        queryKey: ["currentAcademicPeriod", schoolId],
      });
      queryClient.invalidateQueries({ queryKey: ["classStats", schoolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set current academic term
  const setCurrentTerm = useMutation({
    mutationFn: async (termId: string) => {
      if (!schoolId) throw new Error("No school ID");

      // First, unset all current terms for this school
      await supabase
        .from("academic_terms")
        .update({ is_current: false })
        .eq("school_id", schoolId);

      // Then set the selected term as current
      const { error } = await supabase
        .from("academic_terms")
        .update({ is_current: true })
        .eq("id", termId)
        .eq("school_id", schoolId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Current academic term updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["academicTerms", schoolId] });
      queryClient.invalidateQueries({
        queryKey: ["currentAcademicPeriod", schoolId],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEntityCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["academicYears", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["academicTerms", schoolId] });
    queryClient.invalidateQueries({
      queryKey: ["currentAcademicPeriod", schoolId],
    });
  };

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No school assignment found. Please contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const loading = loadingYears || loadingTerms || loadingPeriod || loadingStats;

  return (
    <div className="space-y-6">
      {/* Current Academic Period Overview */}
      {currentPeriod && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-5 w-5" />
              Current Academic Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Current Year
                  </Badge>
                  <span className="font-medium">
                    {currentPeriod.year?.year_name || "Not Set"}
                  </span>
                </div>
                {currentPeriod.year && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      currentPeriod.year.start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(currentPeriod.year.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Current Term
                  </Badge>
                  <span className="font-medium">
                    {currentPeriod.term?.term_name || "Not Set"}
                  </span>
                </div>
                {currentPeriod.term && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      currentPeriod.term.start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(currentPeriod.term.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Statistics */}
      {classStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-xl font-bold">{classStats.totalClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Classes
                  </p>
                  <p className="text-xl font-bold">
                    {classStats.activeClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CBC Classes</p>
                  <p className="text-xl font-bold">{classStats.cbcClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IGCSE Classes</p>
                  <p className="text-xl font-bold">{classStats.igcseClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Academic Years Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Academic Years
            </CardTitle>
            <Button onClick={() => setShowYearModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingYears ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid gap-4">
              {academicYears?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No academic years found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first academic year to get started.
                  </p>
                </div>
              ) : (
                academicYears?.map((year) => (
                  <div
                    key={year.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{year.year_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(year.start_date).toLocaleDateString()} -{" "}
                          {new Date(year.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Term Structure: {year.term_structure || "3-term"}
                        </p>
                      </div>
                      {year.is_current && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    {!year.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentYear.mutate(year.id)}
                        disabled={setCurrentYear.isPending}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set as Current
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Terms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Academic Terms
            </CardTitle>
            <Button
              onClick={() => setShowTermModal(true)}
              size="sm"
              disabled={!academicYears?.length}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTerms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="grid gap-4">
              {academicTerms?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No academic terms found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {academicYears?.length
                      ? "Create your first academic term to get started."
                      : "Create an academic year first."}
                  </p>
                </div>
              ) : (
                academicTerms?.map((term) => (
                  <div
                    key={term.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{term.term_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {term.academic_years?.year_name} •{" "}
                          {new Date(term.start_date).toLocaleDateString()} -{" "}
                          {new Date(term.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {term.is_current && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    {!term.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTerm.mutate(term.id)}
                        disabled={setCurrentTerm.isPending}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set as Current
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning if no current period set */}
      {!loading && (!currentPeriod?.year || !currentPeriod?.term) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> No current academic year or term is set.
            This may affect data entry and reporting across the system. Please
            set a current academic year and term.
          </AlertDescription>
        </Alert>
      )}

      {/* Modals */}
      <AcademicYearModal
        open={showYearModal}
        onClose={() => setShowYearModal(false)}
        onYearCreated={handleEntityCreated}
      />
      <AcademicTermModal
        open={showTermModal}
        onClose={() => setShowTermModal(false)}
        onTermCreated={handleEntityCreated}
      />
    </div>
  );
};

export default EnhancedAcademicYearTermManagement;
