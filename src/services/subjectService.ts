
import { SubjectValidationService } from './subject/subjectValidationService';
import { SubjectDatabaseService } from './subject/subjectDatabaseService';
import { SubjectAssignmentService } from './subject/subjectAssignmentService';
import { Subject, SubjectCreationData, SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    console.log('SubjectService.createSubject called with:', { data, schoolId });

    try {
      // Validate basic data
      const formattedCode = await SubjectValidationService.validateSubjectData(
        data.name, 
        data.code, 
        schoolId
      );

      // Check for duplicates
      await SubjectValidationService.checkDuplicates(
        data.name, 
        formattedCode, 
        schoolId
      );

      // Validate references
      await SubjectValidationService.validateReferences(
        data.class_id, 
        data.teacher_id, 
        schoolId
      );

      // Create the subject
      const subjectData = { ...data, code: formattedCode };
      return await SubjectDatabaseService.createSubject(subjectData, schoolId);

    } catch (error: any) {
      console.error('SubjectService.createSubject error:', error);
      throw error;
    }
  }

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    console.log('SubjectService.getSubjects called with:', { schoolId, classId });
    return await SubjectDatabaseService.getSubjects(schoolId, classId);
  }

  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    return await SubjectAssignmentService.createAssignment(data, schoolId);
  }

  static async getAssignments(schoolId: string, classId?: string): Promise<SubjectAssignment[]> {
    return await SubjectAssignmentService.getAssignments(schoolId, classId);
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    return await SubjectAssignmentService.removeAssignment(assignmentId);
  }
}
