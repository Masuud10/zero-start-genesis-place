
-- Add a unique constraint to the attendance table to prevent duplicate entries
-- and enable efficient 'upsert' operations.
ALTER TABLE public.attendance
ADD CONSTRAINT attendance_unique_constraint UNIQUE (school_id, class_id, student_id, date, session);
