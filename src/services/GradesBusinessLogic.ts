import { supabase } from '@/integrations/supabase/client';

interface GradeRecord {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'released';
  term: string;
  exam_type: string;
  academic_year: string;
  school_id: string;
}

interface GradesSummaryData {
  overall_average: number;
  total_grades: number;
  grade_distribution: GradeDistribution;
  subject_performance: SubjectPerformance[];
  class_performance: ClassPerformance[];
  workflow_status: WorkflowStatus;
  performance_trends: PerformanceTrend[];
  top_performers: TopPerformer[];
  underperformers: UnderPerformer[];
}

interface GradeDistribution {
  excellent: number; // A grades (80-100%)
  good: number; // B grades (70-79%)
  satisfactory: number; // C grades (60-69%)
  needs_improvement: number; // D grades (40-59%)
  failing: number; // F grades (0-39%)
}

interface SubjectPerformance {
  subject_id: string;
  subject_name: string;
  average_score: number;
  grade_count: number;
  improvement_trend: 'up' | 'down' | 'stable';
  difficulty_index: number;
}

interface ClassPerformance {
  class_id: string;
  class_name: string;
  student_count: number;
  average_percentage: number;
  top_student: string;
  improvement_rate: number;
}

interface WorkflowStatus {
  pending_approval: number;
  approved: number;
  rejected: number;
  released: number;
  draft: number;
}

interface PerformanceTrend {
  period: string;
  average_score: number;
  trend_direction: 'up' | 'down' | 'stable';
}

interface TopPerformer {
  student_id: string;
  student_name: string;
  overall_percentage: number;
  subject_count: number;
}

interface UnderPerformer {
  student_id: string;
  student_name: string;
  overall_percentage: number;
  failing_subjects: number;
  improvement_potential: number;
}

export class GradesBusinessLogic {
  private schoolId: string;

  constructor(schoolId: string) {
    this.schoolId = schoolId;
  }

  /**
   * Calculate comprehensive grades summary for admin dashboard
   */
  async calculateGradesSummary(filters?: {
    academic_year?: string;
    term?: string;
    class_id?: string;
  }): Promise<GradesSummaryData> {
    try {
      // Get base grades data
      const baseQuery = supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          class_id,
          score,
          max_score,
          percentage,
          letter_grade,
          status,
          term,
          exam_type,
          academic_year,
          subjects!inner(name, code),
          classes!inner(name),
          students!inner(name, admission_number)
        `)
        .eq('school_id', this.schoolId);

      if (filters?.academic_year) {
        baseQuery.eq('academic_year', filters.academic_year);
      }
      if (filters?.term) {
        baseQuery.eq('term', filters.term);
      }
      if (filters?.class_id) {
        baseQuery.eq('class_id', filters.class_id);
      }

      const { data: gradesData, error } = await baseQuery;

      if (error) throw error;
      if (!gradesData) throw new Error('No grades data found');

      // Calculate overall statistics
      const totalGrades = gradesData.length;
      const overallAverage = totalGrades > 0 
        ? Math.round(gradesData.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / totalGrades)
        : 0;

      // Calculate grade distribution
      const gradeDistribution = this.calculateGradeDistribution(gradesData);

      // Calculate subject performance
      const subjectPerformance = await this.calculateSubjectPerformance(gradesData);

      // Calculate class performance
      const classPerformance = await this.calculateClassPerformance(gradesData);

      // Calculate workflow status
      const workflowStatus = this.calculateWorkflowStatus(gradesData);

      // Calculate performance trends
      const performanceTrends = await this.calculatePerformanceTrends(gradesData);

      // Identify top performers and underperformers
      const topPerformers = this.identifyTopPerformers(gradesData);
      const underperformers = this.identifyUnderperformers(gradesData);

      return {
        overall_average: overallAverage,
        total_grades: totalGrades,
        grade_distribution: gradeDistribution,
        subject_performance: subjectPerformance,
        class_performance: classPerformance,
        workflow_status: workflowStatus,
        performance_trends: performanceTrends,
        top_performers: topPerformers,
        underperformers: underperformers
      };

    } catch (error) {
      console.error('Error calculating grades summary:', error);
      throw error;
    }
  }

  /**
   * Calculate grade distribution statistics
   */
  private calculateGradeDistribution(gradesData: any[]): GradeDistribution {
    const distribution = {
      excellent: 0,
      good: 0,
      satisfactory: 0,
      needs_improvement: 0,
      failing: 0
    };

    gradesData.forEach(grade => {
      const percentage = grade.percentage || 0;
      if (percentage >= 80) distribution.excellent++;
      else if (percentage >= 70) distribution.good++;
      else if (percentage >= 60) distribution.satisfactory++;
      else if (percentage >= 40) distribution.needs_improvement++;
      else distribution.failing++;
    });

    return distribution;
  }

  /**
   * Calculate subject-specific performance metrics
   */
  private async calculateSubjectPerformance(gradesData: any[]): Promise<SubjectPerformance[]> {
    const subjectData = new Map<string, any[]>();
    
    // Group by subject
    gradesData.forEach(grade => {
      const subjectId = grade.subject_id;
      if (!subjectData.has(subjectId)) {
        subjectData.set(subjectId, []);
      }
      subjectData.get(subjectId)!.push(grade);
    });

    const performance: SubjectPerformance[] = [];

    for (const [subjectId, grades] of subjectData) {
      const subjectName = grades[0]?.subjects?.name || 'Unknown Subject';
      const averageScore = grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
        : 0;

      // Calculate difficulty index (inverse of average score)
      const difficultyIndex = Math.max(0, 100 - averageScore) / 100;

      // Calculate improvement trend (requires historical data comparison)
      const improvementTrend = await this.calculateSubjectTrend(subjectId, grades);

      performance.push({
        subject_id: subjectId,
        subject_name: subjectName,
        average_score: averageScore,
        grade_count: grades.length,
        improvement_trend: improvementTrend,
        difficulty_index: difficultyIndex
      });
    }

    return performance.sort((a, b) => b.average_score - a.average_score);
  }

  /**
   * Calculate class-specific performance metrics
   */
  private async calculateClassPerformance(gradesData: any[]): Promise<ClassPerformance[]> {
    const classData = new Map<string, any[]>();
    
    // Group by class
    gradesData.forEach(grade => {
      const classId = grade.class_id;
      if (!classData.has(classId)) {
        classData.set(classId, []);
      }
      classData.get(classId)!.push(grade);
    });

    const performance: ClassPerformance[] = [];

    for (const [classId, grades] of classData) {
      const className = grades[0]?.classes?.name || 'Unknown Class';
      const uniqueStudents = new Set(grades.map(g => g.student_id));
      const averagePercentage = grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
        : 0;

      // Find top student in class
      const studentAverages = new Map<string, { total: number; count: number; name: string }>();
      grades.forEach(grade => {
        const studentId = grade.student_id;
        if (!studentAverages.has(studentId)) {
          studentAverages.set(studentId, { 
            total: 0, 
            count: 0, 
            name: grade.students?.name || 'Unknown Student'
          });
        }
        const stats = studentAverages.get(studentId)!;
        stats.total += grade.percentage || 0;
        stats.count++;
      });

      let topStudent = 'None';
      let highestAverage = 0;
      for (const [_, stats] of studentAverages) {
        const average = stats.count > 0 ? stats.total / stats.count : 0;
        if (average > highestAverage) {
          highestAverage = average;
          topStudent = stats.name;
        }
      }

      // Calculate improvement rate (simplified)
      const improvementRate = this.calculateClassImprovementRate(grades);

      performance.push({
        class_id: classId,
        class_name: className,
        student_count: uniqueStudents.size,
        average_percentage: averagePercentage,
        top_student: topStudent,
        improvement_rate: improvementRate
      });
    }

    return performance.sort((a, b) => b.average_percentage - a.average_percentage);
  }

  /**
   * Calculate workflow status distribution
   */
  private calculateWorkflowStatus(gradesData: any[]): WorkflowStatus {
    const status = {
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      released: 0,
      draft: 0
    };

    gradesData.forEach(grade => {
      const gradeStatus = grade.status;
      if (gradeStatus === 'pending_approval') status.pending_approval++;
      else if (gradeStatus === 'approved') status.approved++;
      else if (gradeStatus === 'rejected') status.rejected++;
      else if (gradeStatus === 'released') status.released++;
      else status.draft++;
    });

    return status;
  }

  /**
   * Calculate performance trends over time
   */
  private async calculatePerformanceTrends(gradesData: any[]): Promise<PerformanceTrend[]> {
    // Group by term/exam type combinations
    const periodData = new Map<string, any[]>();
    
    gradesData.forEach(grade => {
      const period = `${grade.term}-${grade.exam_type}`;
      if (!periodData.has(period)) {
        periodData.set(period, []);
      }
      periodData.get(period)!.push(grade);
    });

    const trends: PerformanceTrend[] = [];

    for (const [period, grades] of periodData) {
      const averageScore = grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
        : 0;

      trends.push({
        period,
        average_score: averageScore,
        trend_direction: 'stable' // Will be calculated relative to previous periods
      });
    }

    // Sort and calculate trend directions
    trends.sort((a, b) => a.period.localeCompare(b.period));
    
    for (let i = 1; i < trends.length; i++) {
      const current = trends[i].average_score;
      const previous = trends[i - 1].average_score;
      const difference = current - previous;
      
      if (difference > 3) {
        trends[i].trend_direction = 'up';
      } else if (difference < -3) {
        trends[i].trend_direction = 'down';
      } else {
        trends[i].trend_direction = 'stable';
      }
    }

    return trends.slice(-6); // Return last 6 periods
  }

  /**
   * Identify top performing students
   */
  private identifyTopPerformers(gradesData: any[]): TopPerformer[] {
    const studentPerformance = new Map<string, { 
      total: number; 
      count: number; 
      name: string;
    }>();

    // Calculate student averages
    gradesData.forEach(grade => {
      const studentId = grade.student_id;
      if (!studentPerformance.has(studentId)) {
        studentPerformance.set(studentId, { 
          total: 0, 
          count: 0, 
          name: grade.students?.name || 'Unknown Student'
        });
      }
      const stats = studentPerformance.get(studentId)!;
      stats.total += grade.percentage || 0;
      stats.count++;
    });

    const performers: TopPerformer[] = [];
    
    for (const [studentId, stats] of studentPerformance) {
      const overallPercentage = stats.count > 0 ? Math.round(stats.total / stats.count) : 0;
      
      if (overallPercentage >= 85 && stats.count >= 3) { // Must have at least 3 grades
        performers.push({
          student_id: studentId,
          student_name: stats.name,
          overall_percentage: overallPercentage,
          subject_count: stats.count
        });
      }
    }

    return performers
      .sort((a, b) => b.overall_percentage - a.overall_percentage)
      .slice(0, 10); // Top 10 performers
  }

  /**
   * Identify underperforming students
   */
  private identifyUnderperformers(gradesData: any[]): UnderPerformer[] {
    const studentPerformance = new Map<string, { 
      total: number; 
      count: number; 
      failingCount: number;
      name: string;
    }>();

    // Calculate student performance metrics
    gradesData.forEach(grade => {
      const studentId = grade.student_id;
      if (!studentPerformance.has(studentId)) {
        studentPerformance.set(studentId, { 
          total: 0, 
          count: 0, 
          failingCount: 0,
          name: grade.students?.name || 'Unknown Student'
        });
      }
      const stats = studentPerformance.get(studentId)!;
      stats.total += grade.percentage || 0;
      stats.count++;
      
      if ((grade.percentage || 0) < 60) {
        stats.failingCount++;
      }
    });

    const underperformers: UnderPerformer[] = [];
    
    for (const [studentId, stats] of studentPerformance) {
      const overallPercentage = stats.count > 0 ? Math.round(stats.total / stats.count) : 0;
      const improvementPotential = Math.max(0, 70 - overallPercentage); // Potential to reach 70%
      
      if ((overallPercentage < 60 || stats.failingCount >= 2) && stats.count >= 3) {
        underperformers.push({
          student_id: studentId,
          student_name: stats.name,
          overall_percentage: overallPercentage,
          failing_subjects: stats.failingCount,
          improvement_potential: improvementPotential
        });
      }
    }

    return underperformers
      .sort((a, b) => b.improvement_potential - a.improvement_potential)
      .slice(0, 15); // Top 15 students needing support
  }

  /**
   * Calculate subject improvement trend (simplified)
   */
  private async calculateSubjectTrend(subjectId: string, currentGrades: any[]): Promise<'up' | 'down' | 'stable'> {
    // This would ideally compare with historical data
    // For now, we'll use a simplified approach based on current data spread
    const scores = currentGrades.map(g => g.percentage || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const recentScores = scores.slice(-Math.ceil(scores.length / 3)); // Last third of scores
    const recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    
    const difference = recentAverage - average;
    if (difference > 2) return 'up';
    if (difference < -2) return 'down';
    return 'stable';
  }

  /**
   * Calculate class improvement rate (simplified)
   */
  private calculateClassImprovementRate(grades: any[]): number {
    // Simplified calculation based on variance in performance
    const scores = grades.map(g => g.percentage || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    
    // Lower variance indicates more consistent (improved) performance
    return Math.max(0, Math.round((100 - Math.sqrt(variance)) / 10));
  }

  /**
   * Generate comprehensive insights for dashboard
   */
  async generateGradesInsights(): Promise<{
    key_metrics: Record<string, number>;
    recommendations: string[];
    alerts: string[];
  }> {
    try {
      const summary = await this.calculateGradesSummary();

      const keyMetrics = {
        overall_average: summary.overall_average,
        total_grades: summary.total_grades,
        pending_approval: summary.workflow_status.pending_approval,
        top_performers: summary.top_performers.length,
        underperformers: summary.underperformers.length
      };

      const recommendations: string[] = [];
      const alerts: string[] = [];

      // Generate recommendations
      if (summary.overall_average < 70) {
        recommendations.push('Consider implementing academic support programs');
      }
      if (summary.underperformers.length > summary.total_grades * 0.2) {
        recommendations.push('High number of underperformers requires immediate intervention');
      }
      if (summary.workflow_status.pending_approval > 50) {
        recommendations.push('Large number of grades pending approval - review workflow efficiency');
      }

      // Generate alerts
      if (summary.grade_distribution.failing > summary.total_grades * 0.15) {
        alerts.push(`High failure rate: ${summary.grade_distribution.failing} failing grades`);
      }
      if (summary.workflow_status.rejected > 10) {
        alerts.push(`${summary.workflow_status.rejected} grades have been rejected`);
      }

      return {
        key_metrics: keyMetrics,
        recommendations,
        alerts
      };
    } catch (error) {
      console.error('Error generating grades insights:', error);
      throw error;
    }
  }
}