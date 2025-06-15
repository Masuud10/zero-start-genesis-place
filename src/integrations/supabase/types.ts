export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_terms: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          school_id: string
          start_date: string
          term_name: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          school_id: string
          start_date: string
          term_name: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          school_id?: string
          start_date?: string
          term_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          school_id: string
          start_date: string
          year_name: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          school_id: string
          start_date: string
          year_name: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          school_id?: string
          start_date?: string
          year_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_type: string
          id: string
          metadata: Json | null
          school_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_type: string
          id?: string
          metadata?: Json | null
          school_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          school_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string | null
          id: string
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_recipients: {
        Row: {
          announcement_id: string
          created_at: string | null
          delivered_at: string | null
          delivery_channel: string | null
          delivery_status: string | null
          id: string
          read_at: string | null
          region: string | null
          school_id: string | null
          school_type: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          id?: string
          read_at?: string | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          id?: string
          read_at?: string | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_recipients_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: string[] | null
          auto_archive_date: string | null
          content: string
          created_at: string | null
          created_by: string | null
          delivery_channels: string[] | null
          expiry_date: string | null
          id: string
          is_archived: boolean | null
          is_global: boolean | null
          priority: string | null
          read_count: number | null
          region: string | null
          school_id: string | null
          school_type: string | null
          tags: string[] | null
          target_audience: string[]
          title: string
          total_recipients: number | null
        }
        Insert: {
          attachments?: string[] | null
          auto_archive_date?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          delivery_channels?: string[] | null
          expiry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_global?: boolean | null
          priority?: string | null
          read_count?: number | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          tags?: string[] | null
          target_audience: string[]
          title: string
          total_recipients?: number | null
        }
        Update: {
          attachments?: string[] | null
          auto_archive_date?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          delivery_channels?: string[] | null
          expiry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_global?: boolean | null
          priority?: string | null
          read_count?: number | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          tags?: string[] | null
          target_audience?: string[]
          title?: string
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          academic_year: string | null
          class_id: string | null
          date: string
          id: string
          remarks: string | null
          school_id: string | null
          session: string | null
          status: string | null
          student_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          term: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          class_id?: string | null
          date: string
          id?: string
          remarks?: string | null
          school_id?: string | null
          session?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          class_id?: string | null
          date?: string
          id?: string
          remarks?: string | null
          school_id?: string | null
          session?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_summary: {
        Row: {
          absent_days: number | null
          academic_year: string
          attendance_percentage: number | null
          class_id: string
          id: string
          late_days: number | null
          present_days: number | null
          school_id: string
          student_id: string
          term: string
          total_days: number | null
          updated_at: string | null
        }
        Insert: {
          absent_days?: number | null
          academic_year: string
          attendance_percentage?: number | null
          class_id: string
          id?: string
          late_days?: number | null
          present_days?: number | null
          school_id: string
          student_id: string
          term: string
          total_days?: number | null
          updated_at?: string | null
        }
        Update: {
          absent_days?: number | null
          academic_year?: string
          attendance_percentage?: number | null
          class_id?: string
          id?: string
          late_days?: number | null
          present_days?: number | null
          school_id?: string
          student_id?: string
          term?: string
          total_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_summary_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          processed_at: string | null
          school_id: string
          status: string
          stripe_payment_id: string | null
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          school_id: string
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          school_id?: string
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_assessments: {
        Row: {
          assessment_date: string
          assessment_type: string
          class_id: string
          competency_id: string | null
          created_at: string
          evidence_description: string | null
          id: string
          is_final: boolean | null
          performance_level: string
          student_id: string
          subject_id: string | null
          submitted_at: string
          submitted_by: string
          teacher_observation: string | null
          term: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          assessment_type: string
          class_id: string
          competency_id?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          is_final?: boolean | null
          performance_level: string
          student_id: string
          subject_id?: string | null
          submitted_at?: string
          submitted_by: string
          teacher_observation?: string | null
          term: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          assessment_type?: string
          class_id?: string
          competency_id?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          is_final?: boolean | null
          performance_level?: string
          student_id?: string
          subject_id?: string | null
          submitted_at?: string
          submitted_by?: string
          teacher_observation?: string | null
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbc_assessments_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbc_assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          school_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          school_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      competency_progress: {
        Row: {
          competency_id: string | null
          current_level: string
          id: string
          last_assessed_date: string | null
          milestones_achieved: Json | null
          progress_percentage: number | null
          recommended_activities: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          competency_id?: string | null
          current_level: string
          id?: string
          last_assessed_date?: string | null
          milestones_achieved?: Json | null
          progress_percentage?: number | null
          recommended_activities?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          competency_id?: string | null
          current_level?: string
          id?: string
          last_assessed_date?: string | null
          milestones_achieved?: Json | null
          progress_percentage?: number | null
          recommended_activities?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_progress_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          academic_year: string | null
          amount: number
          category: string | null
          created_at: string | null
          discount_amount: number | null
          due_date: string
          id: string
          installment_number: number | null
          late_fee_amount: number | null
          mpesa_code: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          school_id: string | null
          status: string | null
          student_id: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          installment_number?: number | null
          late_fee_amount?: number | null
          mpesa_code?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          school_id?: string | null
          status?: string | null
          student_id?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          installment_number?: number | null
          late_fee_amount?: number | null
          mpesa_code?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          school_id?: string | null
          status?: string | null
          student_id?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          academic_year: string | null
          amount: number
          bank_reference: string | null
          created_at: string | null
          description: string | null
          fee_id: string | null
          id: string
          mpesa_code: string | null
          payment_method: string | null
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          school_id: string
          student_id: string | null
          term: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          bank_reference?: string | null
          created_at?: string | null
          description?: string | null
          fee_id?: string | null
          id?: string
          mpesa_code?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          school_id: string
          student_id?: string | null
          term?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          bank_reference?: string | null
          created_at?: string | null
          description?: string | null
          fee_id?: string | null
          id?: string
          mpesa_code?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          school_id?: string
          student_id?: string | null
          term?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_summary: {
        Row: {
          academic_year: string
          average_score: number | null
          class_id: string
          class_position: number | null
          grade_letter: string | null
          id: string
          possible_marks: number | null
          school_id: string
          student_id: string
          term: string
          total_marks: number | null
          total_subjects: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          average_score?: number | null
          class_id: string
          class_position?: number | null
          grade_letter?: string | null
          id?: string
          possible_marks?: number | null
          school_id: string
          student_id: string
          term: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          average_score?: number | null
          class_id?: string
          class_position?: number | null
          grade_letter?: string | null
          id?: string
          possible_marks?: number | null
          school_id?: string
          student_id?: string
          term?: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_summary_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          class_id: string | null
          comments: string | null
          created_at: string | null
          exam_type: string | null
          id: string
          is_immutable: boolean | null
          is_released: boolean | null
          max_score: number
          percentage: number | null
          position: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number
          status: string | null
          student_id: string | null
          subject_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          comments?: string | null
          created_at?: string | null
          exam_type?: string | null
          id?: string
          is_immutable?: boolean | null
          is_released?: boolean | null
          max_score?: number
          percentage?: number | null
          position?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score: number
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          comments?: string | null
          created_at?: string | null
          exam_type?: string | null
          id?: string
          is_immutable?: boolean | null
          is_released?: boolean | null
          max_score?: number
          percentage?: number | null
          position?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_grades_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_subject_id"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_portfolios: {
        Row: {
          competency_id: string | null
          created_at: string
          created_by: string
          description: string | null
          file_urls: string[] | null
          id: string
          reflection_notes: string | null
          student_id: string
          subject_id: string | null
          teacher_feedback: string | null
          title: string
        }
        Insert: {
          competency_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          reflection_notes?: string | null
          student_id: string
          subject_id?: string | null
          teacher_feedback?: string | null
          title: string
        }
        Update: {
          competency_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          reflection_notes?: string | null
          student_id?: string
          subject_id?: string | null
          teacher_feedback?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_portfolios_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_portfolios_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          school_id: string | null
          sender_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          school_id?: string | null
          sender_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          school_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret_key: string
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret_key: string
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret_key?: string
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      parent_engagements: {
        Row: {
          competencies_addressed: string[] | null
          created_at: string
          date_recorded: string
          description: string
          engagement_type: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          competencies_addressed?: string[] | null
          created_at?: string
          date_recorded?: string
          description: string
          engagement_type: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          competencies_addressed?: string[] | null
          created_at?: string
          date_recorded?: string
          description?: string
          engagement_type?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string | null
          id: string
          is_primary_contact: boolean | null
          parent_id: string
          relationship_type: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary_contact?: boolean | null
          parent_id: string
          relationship_type?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary_contact?: boolean | null
          parent_id?: string
          relationship_type?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          failed_login_attempts: number | null
          id: string
          last_login_at: string | null
          last_login_ip: unknown | null
          locked_until: string | null
          mfa_enabled: boolean | null
          name: string
          password_changed_at: string | null
          role: string
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          failed_login_attempts?: number | null
          id: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          name: string
          password_changed_at?: string | null
          role?: string
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          failed_login_attempts?: number | null
          id?: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          name?: string
          password_changed_at?: string | null
          role?: string
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      school_analytics_summary: {
        Row: {
          attendance_updates: number | null
          created_at: string
          finance_transactions: number | null
          grade_submissions: number | null
          id: string
          last_updated: string
          school_id: string
          user_activities: number | null
        }
        Insert: {
          attendance_updates?: number | null
          created_at?: string
          finance_transactions?: number | null
          grade_submissions?: number | null
          id?: string
          last_updated?: string
          school_id: string
          user_activities?: number | null
        }
        Update: {
          attendance_updates?: number | null
          created_at?: string
          finance_transactions?: number | null
          grade_submissions?: number | null
          id?: string
          last_updated?: string
          school_id?: string
          user_activities?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          principal_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          principal_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          principal_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string | null
          enrollment_date: string | null
          id: string
          is_active: boolean | null
          student_id: string
        }
        Insert: {
          academic_year?: string
          class_id: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          student_id: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_number: string
          avatar_url: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          medical_notes: string | null
          name: string
          parent_contact: string | null
          parent_id: string | null
          roll_number: string | null
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_number: string
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name: string
          parent_contact?: string | null
          parent_id?: string | null
          roll_number?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_number?: string
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name?: string
          parent_contact?: string | null
          parent_id?: string | null
          roll_number?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_parent_id"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_competencies: {
        Row: {
          competency_id: string | null
          created_at: string
          id: string
          subject_id: string | null
          weight: number | null
        }
        Insert: {
          competency_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          weight?: number | null
        }
        Update: {
          competency_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_competencies_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_id: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          school_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          school_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subjects_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          end_date: string
          id: string
          plan_type: string
          school_id: string
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          end_date: string
          id?: string
          plan_type: string
          school_id: string
          start_date: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          plan_type?: string
          school_id?: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          school_id: string | null
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string | null
          title: string
          type?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          subject_id: string | null
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          subject_id?: string | null
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          created_at: string | null
          day: string | null
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
          timetable_id: string | null
        }
        Insert: {
          created_at?: string | null
          day?: string | null
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
          timetable_id?: string | null
        }
        Update: {
          created_at?: string | null
          day?: string | null
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
          timetable_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          class_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          school_id: string | null
          version: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string | null
          version?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_details: {
        Row: {
          access_level: number | null
          created_at: string
          department: string | null
          employee_id: string | null
          force_password_change: boolean | null
          id: string
          is_locked: boolean | null
          last_login: string | null
          locked_until: string | null
          login_attempts: number | null
          password_changed_at: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: number | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          force_password_change?: boolean | null
          id?: string
          is_locked?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: number | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          force_password_change?: boolean | null
          id?: string
          is_locked?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_school_to_user: {
        Args: { target_user_id: string; target_school_id: string }
        Returns: Json
      }
      auto_archive_announcements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_action: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      create_admin_user: {
        Args: {
          user_email: string
          user_password: string
          user_name: string
          user_role?: string
          user_school_id?: string
        }
        Returns: Json
      }
      create_school: {
        Args: {
          school_name: string
          school_email: string
          school_phone: string
          school_address: string
          owner_email?: string
          owner_name?: string
        }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      handle_login_attempt: {
        Args: { user_email: string; success?: boolean }
        Returns: Json
      }
      is_grade_in_user_school: {
        Args: { grade_student_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource: string
          p_resource_id?: string
          p_success?: boolean
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: string
      }
      requires_mfa: {
        Args: { user_role: string }
        Returns: boolean
      }
      update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
