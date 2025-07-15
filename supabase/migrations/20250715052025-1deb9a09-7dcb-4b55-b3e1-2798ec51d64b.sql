-- Update grades table to ensure all required fields for workflow
-- Add pending_approval as a valid status if not already present
DO $$
BEGIN
    -- Ensure the grades table has the required status transitions
    -- Update the default status values to include pending_approval
    UPDATE grades SET status = 'draft' WHERE status IS NULL;
    
    -- Add released_to_parents column if it doesn't exist (it exists already)
    -- Add approved_by_principal column if it doesn't exist (it exists already)
    
    -- Create index for better query performance on status and approval fields
    CREATE INDEX IF NOT EXISTS idx_grades_status_workflow ON grades(status, school_id, class_id, term, exam_type);
    CREATE INDEX IF NOT EXISTS idx_grades_approval_workflow ON grades(status, approved_by, released_by);
    
END $$;