export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  score: number;
  maxScore: number;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
  submittedBy: string;
  submittedAt: Date;
  
  // Enhanced workflow fields
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  reviewedBy?: string;
  reviewedAt?: Date;
  releasedBy?: string;
  releasedAt?: Date;
  rejectionReason?: string;
  
  isImmutable: boolean;
  position?: number;
  percentage: number;
  overrideHistory?: GradeOverride[];
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeOverride {
  id: string;
  gradeId: string;
  originalScore: number;
  newScore: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  overrideType: 'teacher_request' | 'principal_override';
}

export interface BulkGradeSubmission {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
  teacherId: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  reviewedBy?: string;
  reviewedAt?: Date;
  releasedBy?: string;
  releasedAt?: Date;
  grades: Grade[];
  totalStudents: number;
  gradesEntered: number;
  principalNotes?: string;
}

export interface GradingWorkflowNotification {
  id: string;
  type: 'grade_submitted' | 'grade_approved' | 'grade_rejected' | 'results_released';
  fromUserId: string;
  toUserId: string;
  gradeSubmissionId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface GradingSession {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
  maxScore: number;
  teacherId: string;
  createdAt: Date;
  isActive: boolean;
  students: GradingStudent[];
}

export interface GradingStudent {
  studentId: string;
  name: string;
  admissionNumber: string;
  rollNumber: string;
  currentScore?: number;
  percentage?: number;
  position?: number;
  isAbsent?: boolean;
}

// CBC-specific types
export interface Competency {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'subject_specific';
  created_at: Date;
}

export interface SubjectCompetency {
  id: string;
  subjectId: string;
  competencyId: string;
  weight: number;
  created_at: Date;
}

export interface CBCAssessment {
  id: string;
  studentId: string;
  subjectId: string;
  competencyId: string;
  classId: string;
  term: string;
  assessmentType: 'formative' | 'summative' | 'project' | 'observation';
  performanceLevel: 'EMERGING' | 'APPROACHING' | 'PROFICIENT' | 'EXCEEDING';
  evidenceDescription?: string;
  teacherObservation?: string;
  assessmentDate: Date;
  submittedBy: string;
  submittedAt: Date;
  isFinal: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LearnerPortfolioItem {
  id: string;
  studentId: string;
  title: string;
  description: string;
  competencyId?: string;
  subjectId?: string;
  fileUrls: string[];
  reflectionNotes?: string;
  teacherFeedback?: string;
  createdBy: string;
  created_at: Date;
}

export interface CompetencyProgress {
  id: string;
  studentId: string;
  competencyId: string;
  currentLevel: 'EMERGING' | 'APPROACHING' | 'PROFICIENT' | 'EXCEEDING';
  progressPercentage: number;
  lastAssessedDate?: Date;
  milestonesAchieved: string[];
  recommendedActivities: string[];
  updated_at: Date;
}

export interface ParentEngagement {
  id: string;
  studentId: string;
  parentId: string;
  engagementType: 'home_project' | 'observation' | 'feedback' | 'support_activity';
  description: string;
  competenciesAddressed: string[];
  dateRecorded: Date;
  created_at: Date;
}

export interface CBCProgressReport {
  studentId: string;
  studentName: string;
  term: string;
  competencyProgress: {
    competencyId: string;
    competencyName: string;
    currentLevel: 'EMERGING' | 'APPROACHING' | 'PROFICIENT' | 'EXCEEDING';
    progressPercentage: number;
    assessments: CBCAssessment[];
    portfolioItems: LearnerPortfolioItem[];
    parentEngagements: ParentEngagement[];
  }[];
  overallProgress: number;
  teacherRecommendations: string[];
  parentFeedback?: string;
}
