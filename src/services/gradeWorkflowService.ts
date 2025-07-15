import { supabase } from "@/integrations/supabase/client";

export interface GradeSubmissionPayload {
  gradeIds: string[];
  classId: string;
  subjectId: string;
  term: string;
  examType: string;
}

export interface GradeApprovalPayload {
  gradeIds: string[];
  action: 'approve' | 'reject' | 'release';
  principalNotes?: string;
  rejectionReason?: string;
}

export interface GradeOverridePayload {
  gradeId: string;
  newScore: number;
  principalNotes?: string;
}

export class GradeWorkflowService {
  /**
   * Phase 2: Teacher submits grades for approval
   */
  static async submitGradesForApproval(payload: GradeSubmissionPayload, teacherId: string): Promise<void> {
    const { gradeIds, classId, subjectId, term, examType } = payload;
    
    // Update grades status from 'draft' to 'pending_approval'
    const { error } = await supabase
      .from('grades')
      .update({
        status: 'pending_approval',
        submitted_at: new Date().toISOString()
      })
      .in('id', gradeIds)
      .eq('status', 'draft')
      .eq('submitted_by', teacherId); // Security: Only allow teacher to submit their own grades

    if (error) {
      throw new Error(`Failed to submit grades: ${error.message}`);
    }
  }

  /**
   * Phase 3: Fetch pending grades for principal review
   */
  static async fetchPendingGrades(schoolId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        students!inner(id, name, admission_number),
        subjects!inner(id, name, code),
        classes!inner(id, name)
      `)
      .eq('status', 'pending_approval')
      .eq('school_id', schoolId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending grades: ${error.message}`);
    }

    // Add submitted_by profile data
    const gradesWithProfiles = await Promise.all(
      (data || []).map(async (grade) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', grade.submitted_by)
          .single();
        
        return {
          ...grade,
          submitted_profile: profile || { id: '', name: 'Unknown' }
        };
      })
    );

    return gradesWithProfiles;
  }

  /**
   * Phase 3: Principal approves grades
   */
  static async approveGrades(payload: GradeApprovalPayload, principalId: string): Promise<void> {
    const { gradeIds, principalNotes } = payload;

    const { error } = await supabase
      .from('grades')
      .update({
        status: 'approved',
        approved_by: principalId,
        approved_at: new Date().toISOString(),
        principal_notes: principalNotes
      })
      .in('id', gradeIds)
      .eq('status', 'pending_approval');

    if (error) {
      throw new Error(`Failed to approve grades: ${error.message}`);
    }
  }

  /**
   * Phase 3: Principal rejects grades
   */
  static async rejectGrades(payload: GradeApprovalPayload, principalId: string): Promise<void> {
    const { gradeIds, rejectionReason } = payload;

    const { error } = await supabase
      .from('grades')
      .update({
        status: 'rejected',
        approved_by: principalId,
        approved_at: new Date().toISOString(),
        principal_notes: rejectionReason
      })
      .in('id', gradeIds)
      .eq('status', 'pending_approval');

    if (error) {
      throw new Error(`Failed to reject grades: ${error.message}`);
    }
  }

  /**
   * Phase 3: Principal overrides grade value
   */
  static async overrideGrade(payload: GradeOverridePayload, principalId: string): Promise<void> {
    const { gradeId, newScore, principalNotes } = payload;

    // Calculate new percentage and letter grade
    const { data: gradeData, error: fetchError } = await supabase
      .from('grades')
      .select('max_score')
      .eq('id', gradeId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch grade data: ${fetchError.message}`);
    }

    const percentage = gradeData.max_score > 0 ? (newScore / gradeData.max_score) * 100 : 0;
    let letterGrade = 'E';
    
    if (percentage >= 90) letterGrade = 'A+';
    else if (percentage >= 80) letterGrade = 'A';
    else if (percentage >= 70) letterGrade = 'B+';
    else if (percentage >= 60) letterGrade = 'B';
    else if (percentage >= 50) letterGrade = 'C+';
    else if (percentage >= 40) letterGrade = 'C';
    else if (percentage >= 30) letterGrade = 'D+';
    else if (percentage >= 20) letterGrade = 'D';

    const { error } = await supabase
      .from('grades')
      .update({
        score: newScore,
        percentage,
        letter_grade: letterGrade,
        status: 'approved',
        approved_by: principalId,
        approved_at: new Date().toISOString(),
        principal_notes: principalNotes,
        overridden_grade: newScore
      })
      .eq('id', gradeId);

    if (error) {
      throw new Error(`Failed to override grade: ${error.message}`);
    }
  }

  /**
   * Phase 3: Principal releases grades to parents
   */
  static async releaseGrades(payload: GradeApprovalPayload, principalId: string): Promise<void> {
    const { gradeIds } = payload;

    const { error } = await supabase
      .from('grades')
      .update({
        status: 'released',
        released_by: principalId,
        released_at: new Date().toISOString(),
        released_to_parents: true
      })
      .in('id', gradeIds)
      .eq('status', 'approved');

    if (error) {
      throw new Error(`Failed to release grades: ${error.message}`);
    }
  }

  /**
   * Phase 4: Fetch released grades for parent view
   */
  static async fetchReleasedGradesForParent(studentId: string, schoolId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        subjects!inner(id, name, code),
        classes!inner(id, name)
      `)
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .eq('status', 'released') // Critical security filter - parents only see released grades
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch released grades: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch all grades for a specific sheet (class + subject + term + exam)
   */
  static async fetchGradeSheet(
    schoolId: string, 
    classId: string, 
    subjectId: string, 
    term: string, 
    examType: string
  ) {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        students!inner(id, name, admission_number, roll_number)
      `)
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .eq('term', term)
      .eq('exam_type', examType)
      .order('students.name');

    if (error) {
      throw new Error(`Failed to fetch grade sheet: ${error.message}`);
    }

    return data || [];
  }
}