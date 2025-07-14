import { supabase } from '@/integrations/supabase/client';
import { detectCurriculumType, getCurriculumInfo } from '@/utils/curriculum-detector';
import { auditLogger } from '@/utils/auditLogger';

export interface GradeData {
  id?: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  letter_grade?: string;
  cbc_performance_level?: string;
  strand_scores?: Record<string, number>;
  competency_id?: string;
  comments?: string;
  status?: string;
  curriculum_type?: string;
  academic_year?: string;
}

export interface GradeSubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface GradeApprovalAction {
  action: 'approve' | 'reject' | 'override' | 'release';
  gradeIds: string[];
  reason?: string;
  overrideScore?: number;
  principalNotes?: string;
}

export interface GradeAuditLog {
  id: string;
  grade_id: string;
  user_id: string;
  user_role: string;
  action: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

export class GradeManagementService {
  /**
   * Submit grades with curriculum-aware validation
   */
  static async submitGrades(
    grades: Record<string, Record<string, GradeData>>,
    classId: string,
    term: string,
    examType: string,
    userId: string,
    schoolId: string
  ): Promise<GradeSubmissionResult> {
    try {
      console.log('🎓 GradeManagementService: Submitting grades', {
        classId,
        term,
        examType,
        userId,
        schoolId,
        gradesCount: Object.keys(grades).length
      });

      // Get class curriculum type
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('curriculum_type, name')
        .eq('id', classId)
        .single();

      if (classError) {
        throw new Error(`Failed to fetch class data: ${classError.message}`);
      }

      const curriculumType = detectCurriculumType(classData.curriculum_type || 'Standard');
      const curriculumInfo = getCurriculumInfo(curriculumType);

      console.log('🎓 GradeManagementService: Curriculum detected', {
        curriculumType,
        curriculumInfo: curriculumInfo.displayName
      });

      // Validate grades based on curriculum
      const validationResult = this.validateGradesByCurriculum(grades, curriculumType, curriculumInfo);
      if (!validationResult.isValid) {
        throw new Error(`Grade validation failed: ${validationResult.error}`);
      }

      // Prepare grade records for submission
      const gradeRecords: any[] = [];
      const processedGrades: string[] = [];

      Object.entries(grades).forEach(([studentId, studentGrades]) => {
        Object.entries(studentGrades).forEach(([subjectId, gradeData]) => {
          if (this.hasValidGradeData(gradeData, curriculumType)) {
            const gradeRecord: any = {
              ...gradeData,
              student_id: studentId,
              subject_id: subjectId,
              class_id: classId,
              term,
              exam_type: examType,
              school_id: schoolId,
              submitted_by: userId,
              submitted_at: new Date().toISOString(),
              status: 'submitted',
              curriculum_type: curriculumType,
              academic_year: new Date().getFullYear().toString()
            };

            gradeRecords.push(gradeRecord);
            processedGrades.push(`${studentId}-${subjectId}`);
          }
        });
      });

      if (gradeRecords.length === 0) {
        throw new Error('No valid grades to submit');
      }

      console.log('🎓 GradeManagementService: Submitting grade records', {
        count: gradeRecords.length,
        processedGrades
      });

      // Submit grades to database
      const { data, error } = await supabase
        .from('grades')
        .upsert(gradeRecords)
        .select();

      if (error) {
        console.error('❌ GradeManagementService: Database error', error);
        throw new Error(`Failed to submit grades: ${error.message}`);
      }

      // Log successful submission
      await auditLogger.logGradeSubmission(userId, {
        classId,
        term,
        examType,
        curriculumType,
        gradesCount: gradeRecords.length,
        processedGrades
      }, true);

      console.log('✅ GradeManagementService: Grades submitted successfully', {
        submittedCount: data?.length || 0
      });

      return {
        success: true,
        data,
        message: `Successfully submitted ${gradeRecords.length} grades for ${curriculumInfo.displayName}`
      };

    } catch (error: any) {
      console.error('❌ GradeManagementService: Submission error', error);
      
      // Log failed submission
      await auditLogger.logGradeSubmission(userId, {
        classId,
        term,
        examType,
        error: error.message
      }, false, error.message);

      return {
        success: false,
        error: error.message || 'Failed to submit grades'
      };
    }
  }

  /**
   * Validate grades based on curriculum type
   */
  private static validateGradesByCurriculum(
    grades: Record<string, Record<string, GradeData>>,
    curriculumType: string,
    curriculumInfo: any
  ): { isValid: boolean; error?: string } {
    const errors: string[] = [];

    Object.entries(grades).forEach(([studentId, studentGrades]) => {
      Object.entries(studentGrades).forEach(([subjectId, gradeData]) => {
        const validation = this.validateSingleGrade(gradeData, curriculumType, curriculumInfo);
        if (!validation.isValid) {
          errors.push(`Student ${studentId}, Subject ${subjectId}: ${validation.error}`);
        }
      });
    });

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join('; ')
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a single grade based on curriculum
   */
  private static validateSingleGrade(
    gradeData: GradeData,
    curriculumType: string,
    curriculumInfo: any
  ): { isValid: boolean; error?: string } {
    switch (curriculumType) {
      case 'cbc':
        return this.validateCBCGrade(gradeData, curriculumInfo);
      case 'igcse':
        return this.validateIGCSEGrade(gradeData, curriculumInfo);
      default:
        return this.validateStandardGrade(gradeData, curriculumInfo);
    }
  }

  /**
   * Validate CBC grade
   */
  private static validateCBCGrade(gradeData: GradeData, curriculumInfo: any): { isValid: boolean; error?: string } {
    // CBC requires either performance level or strand scores
    if (!gradeData.cbc_performance_level && (!gradeData.strand_scores || Object.keys(gradeData.strand_scores || {}).length === 0)) {
      return {
        isValid: false,
        error: 'CBC grade requires either performance level or strand scores'
      };
    }

    if (gradeData.cbc_performance_level && !curriculumInfo.levels.includes(gradeData.cbc_performance_level)) {
      return {
        isValid: false,
        error: `Invalid CBC performance level. Must be one of: ${curriculumInfo.levels.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate IGCSE grade
   */
  private static validateIGCSEGrade(gradeData: GradeData, curriculumInfo: any): { isValid: boolean; error?: string } {
    if (!gradeData.letter_grade) {
      return {
        isValid: false,
        error: 'IGCSE grade requires letter grade'
      };
    }

    if (!curriculumInfo.levels.includes(gradeData.letter_grade)) {
      return {
        isValid: false,
        error: `Invalid IGCSE letter grade. Must be one of: ${curriculumInfo.levels.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate Standard grade
   */
  private static validateStandardGrade(gradeData: GradeData, curriculumInfo: any): { isValid: boolean; error?: string } {
    if (gradeData.score === undefined || gradeData.score === null) {
      return {
        isValid: false,
        error: 'Standard grade requires numeric score'
      };
    }

    if (gradeData.score < 0 || gradeData.score > (gradeData.max_score || 100)) {
      return {
        isValid: false,
        error: `Score must be between 0 and ${gradeData.max_score || 100}`
      };
    }

    return { isValid: true };
  }

  /**
   * Check if grade data has valid content for the curriculum
   */
  private static hasValidGradeData(gradeData: GradeData, curriculumType: string): boolean {
    switch (curriculumType) {
      case 'cbc':
        return !!(gradeData.cbc_performance_level || (gradeData.strand_scores && Object.keys(gradeData.strand_scores).length > 0));
      case 'igcse':
        return !!gradeData.letter_grade;
      default:
        return gradeData.score !== undefined && gradeData.score !== null;
    }
  }

  /**
   * Approve grades - changes status to approved and locks for editing
   */
  static async approveGrades(gradeIds: string[], userId: string, schoolId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current grade values for audit log
      const { data: currentGrades, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .in('id', gradeIds)
        .eq('school_id', schoolId);

      if (fetchError) throw fetchError;

      // Update grades to approved status
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          principal_notes: reason || null,
        })
        .in('id', gradeIds)
        .eq('school_id', schoolId)
        .eq('status', 'submitted'); // Only approve submitted grades

      if (updateError) throw updateError;

      // Create audit logs
      await this.createAuditLogs(
        gradeIds,
        userId,
        'approve',
        currentGrades || [],
        { status: 'approved', approved_by: userId, approved_at: new Date().toISOString() },
        reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error approving grades:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Reject grades - changes status to rejected with reason
   */
  static async rejectGrades(gradeIds: string[], userId: string, schoolId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current grade values for audit log
      const { data: currentGrades, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .in('id', gradeIds)
        .eq('school_id', schoolId);

      if (fetchError) throw fetchError;

      // Update grades to rejected status
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          status: 'rejected',
          rejected_reason: reason,
        })
        .in('id', gradeIds)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved']); // Can reject submitted or approved grades

      if (updateError) throw updateError;

      // Create audit logs
      await this.createAuditLogs(
        gradeIds,
        userId,
        'reject',
        currentGrades || [],
        { status: 'rejected', rejected_reason: reason },
        reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error rejecting grades:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Override grades - changes score and automatically approves
   */
  static async overrideGrades(gradeIds: string[], userId: string, schoolId: string, newScore: number, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate score
      if (newScore < 0 || newScore > 100) {
        return { success: false, error: 'Score must be between 0 and 100' };
      }

      // Get current grade values for audit log
      const { data: currentGrades, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .in('id', gradeIds)
        .eq('school_id', schoolId);

      if (fetchError) throw fetchError;

      // Calculate new percentage
      const newPercentage = (newScore / 100) * 100;

      // Update grades with override
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          score: newScore,
          percentage: newPercentage,
          overridden_by: userId,
          overridden_at: new Date().toISOString(),
          principal_notes: reason,
          status: 'approved', // Override automatically approves
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .in('id', gradeIds)
        .eq('school_id', schoolId);

      if (updateError) throw updateError;

      // Create audit logs
      await this.createAuditLogs(
        gradeIds,
        userId,
        'override',
        currentGrades || [],
        { 
          score: newScore, 
          percentage: newPercentage, 
          overridden_by: userId, 
          overridden_at: new Date().toISOString(),
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString()
        },
        reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error overriding grades:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Release grades to parents - changes status to released
   */
  static async releaseGrades(gradeIds: string[], userId: string, schoolId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current grade values for audit log
      const { data: currentGrades, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .in('id', gradeIds)
        .eq('school_id', schoolId);

      if (fetchError) throw fetchError;

      // Update grades to released status (only approved grades can be released)
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          status: 'released',
          released_by: userId,
          released_at: new Date().toISOString(),
        })
        .in('id', gradeIds)
        .eq('school_id', schoolId)
        .eq('status', 'approved'); // Only release approved grades

      if (updateError) throw updateError;

      // Create audit logs
      await this.createAuditLogs(
        gradeIds,
        userId,
        'release',
        currentGrades || [],
        { status: 'released', released_by: userId, released_at: new Date().toISOString() },
        'Grades released to parents'
      );

      return { success: true };
    } catch (error) {
      console.error('Error releasing grades:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create audit logs for grade actions
   */
  private static async createAuditLogs(
    gradeIds: string[],
    userId: string,
    action: string,
    oldGrades: any[],
    newValues: Record<string, unknown>,
    notes?: string
  ): Promise<void> {
    try {
      // Get user role
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const userRole = userProfile?.role || 'unknown';

      // Create audit log entries
      const auditLogs = gradeIds.map(gradeId => {
        const oldGrade = oldGrades.find(g => g.id === gradeId);
        return {
          grade_id: gradeId,
          user_id: userId,
          user_role: userRole,
          action: action,
          old_values: JSON.stringify(oldGrade || {}),
          new_values: JSON.stringify(newValues),
          school_id: 'temp-school-id', // Will be updated with proper school_id
          created_at: new Date().toISOString(),
        };
      });

      const { error: auditError } = await supabase
        .from('grade_audit_logs')
        .insert(auditLogs);

      if (auditError) {
        console.error('Error creating audit logs:', auditError);
        // Don't throw error for audit log failures - main operation should still succeed
      }
    } catch (error) {
      console.error('Error creating audit logs:', error);
      // Don't throw error for audit log failures
    }
  }

  /**
   * Get grade audit history
   */
  static async getGradeAuditHistory(gradeId: string): Promise<GradeAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('grade_audit_logs')
        .select('*')
        .eq('grade_id', gradeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(log => ({
        ...log,
        old_values: typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values,
        new_values: typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values
      }));
    } catch (error) {
      console.error('Error fetching grade audit history:', error);
      return [];
    }
  }

  /**
   * Get grades with filters for principal dashboard
   */
  static async getGradesForPrincipal(
    schoolId: string,
    filters: {
      classId?: string;
      subjectId?: string;
      status?: string;
      term?: string;
      examType?: string;
    },
    pagination: {
      page: number;
      pageSize: number;
    } = { page: 1, pageSize: 50 }
  ): Promise<{ data: any[]; error?: string; total?: number }> {
    try {
      console.log('🎓 GradeManagementService: Fetching grades for principal', { schoolId, filters, pagination });

      // Calculate offset
      const offset = (pagination.page - 1) * pagination.pageSize;

      let query = supabase
        .from('grades')
        .select(`
          id,
          score,
          max_score,
          percentage,
          letter_grade,
          cbc_performance_level,
          strand_scores,
          status,
          submitted_at,
          approved_by,
          approved_at,
          rejected_reason,
          overridden_by,
          overridden_at,
          principal_notes,
          released_by,
          released_at,
          term,
          exam_type,
          curriculum_type,
          students!inner(name, admission_number),
          subjects!inner(name, code),
          classes!inner(name),
          profiles!inner(name)
        `, { count: 'exact' })
        .eq('school_id', schoolId);

      // Apply filters
      if (filters.classId && filters.classId !== 'all') query = query.eq('class_id', filters.classId);
      if (filters.subjectId && filters.subjectId !== 'all') query = query.eq('subject_id', filters.subjectId);
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.term && filters.term !== 'all') query = query.eq('term', filters.term);
      if (filters.examType && filters.examType !== 'all') query = query.eq('exam_type', filters.examType);

      // Apply pagination
      query = query
        .order('submitted_at', { ascending: false })
        .range(offset, offset + pagination.pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log('✅ GradeManagementService: Fetched grades for principal', {
        count: data?.length || 0,
        total: count || 0,
        page: pagination.page,
        pageSize: pagination.pageSize
      });

      return { 
        data: data || [], 
        total: count || 0 
      };
    } catch (error) {
      console.error('❌ GradeManagementService: Error fetching grades for principal:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Validate if user can perform grade actions
   */
  static async validateGradeActionPermission(
    userId: string,
    schoolId: string,
    action: string
  ): Promise<{ canPerform: boolean; error?: string }> {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Only principals can perform grade management actions
      if (userProfile.role !== 'principal') {
        return { canPerform: false, error: 'Only principals can perform grade management actions' };
      }

      // Verify school access
      if (userProfile.school_id !== schoolId) {
        return { canPerform: false, error: 'Access denied to this school' };
      }

      return { canPerform: true };
    } catch (error) {
      console.error('Error validating grade action permission:', error);
      return { canPerform: false, error: 'Permission validation failed' };
    }
  }

  /**
   * Approve, reject, or override grades
   */
  static async performGradeAction(
    action: GradeApprovalAction,
    userId: string,
    schoolId: string
  ): Promise<GradeSubmissionResult> {
    try {
      console.log('🎓 GradeManagementService: Performing grade action', { action, userId, schoolId });

      const { gradeIds, reason, overrideScore, principalNotes } = action;
      const updateData: any = {
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      };

      switch (action.action) {
        case 'approve':
          updateData.status = 'approved';
          updateData.approved_by = userId;
          updateData.approved_at = new Date().toISOString();
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.rejected_reason = reason;
          break;
        case 'override':
          updateData.status = 'approved';
          updateData.overridden_by = userId;
          updateData.overridden_at = new Date().toISOString();
          updateData.principal_notes = principalNotes;
          if (overrideScore !== undefined) {
            updateData.score = overrideScore;
          }
          break;
        case 'release':
          updateData.status = 'released';
          updateData.released_by = userId;
          updateData.released_at = new Date().toISOString();
          break;
      }

      const { data, error } = await supabase
        .from('grades')
        .update(updateData)
        .in('id', gradeIds)
        .eq('school_id', schoolId)
        .select();

      if (error) throw error;

      // Log the action using basic audit service
      try {
        await this.createAuditLogs(gradeIds, userId, action.action, [], updateData, `Grade ${action.action}`);
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
        // Don't fail the main operation
      }

      console.log('✅ GradeManagementService: Grade action completed', {
        action: action.action,
        processedCount: data?.length || 0
      });

      return {
        success: true,
        data,
        message: `Successfully ${action.action}d ${gradeIds.length} grades`
      };

    } catch (error: any) {
      console.error('❌ GradeManagementService: Grade action error', error);
      return {
        success: false,
        error: error.message || 'Failed to perform grade action'
      };
    }
  }

  /**
   * Get grade statistics for dashboard
   */
  static async getGradeStatistics(
    schoolId: string,
    filters: {
      classId?: string;
      term?: string;
      examType?: string;
    }
  ): Promise<{ data: any; error?: string }> {
    try {
      let query = supabase
        .from('grades')
        .select('status, curriculum_type, score, percentage')
        .eq('school_id', schoolId);

      if (filters.classId) query = query.eq('class_id', filters.classId);
      if (filters.term) query = query.eq('term', filters.term);
      if (filters.examType) query = query.eq('exam_type', filters.examType);

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        submitted: data?.filter(g => g.status === 'submitted').length || 0,
        approved: data?.filter(g => g.status === 'approved').length || 0,
        rejected: data?.filter(g => g.status === 'rejected').length || 0,
        released: data?.filter(g => g.status === 'released').length || 0,
        averageScore: 0,
        curriculumDistribution: {} as Record<string, number>
      };

      // Calculate average score for numeric grades
      const numericGrades = data?.filter(g => g.score !== null && g.score !== undefined) || [];
      if (numericGrades.length > 0) {
        const totalScore = numericGrades.reduce((sum, g) => sum + (g.score || 0), 0);
        stats.averageScore = Math.round((totalScore / numericGrades.length) * 100) / 100;
      }

      // Calculate curriculum distribution
      data?.forEach(grade => {
        const curriculum = grade.curriculum_type || 'standard';
        stats.curriculumDistribution[curriculum] = (stats.curriculumDistribution[curriculum] || 0) + 1;
      });

      return { data: stats };
    } catch (error) {
      console.error('❌ GradeManagementService: Error fetching grade statistics:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 