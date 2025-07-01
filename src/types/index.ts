
// Re-export all types from individual files for backward compatibility
export * from './user';
export * from './school';
export * from './student';
export * from './academic';
export * from './grading';
export * from './finance';
export * from './communication';
export * from './analytics';
export * from './attendance';
export * from './auth';

// Explicitly re-export Subject from subject module to resolve ambiguity
export type { Subject as SubjectEntity, SubjectAssignment, CreateAssignmentData, NewSubjectFormData } from './subject';

// Ensure Grade is available from the main types export
export type { Grade } from './grading';
