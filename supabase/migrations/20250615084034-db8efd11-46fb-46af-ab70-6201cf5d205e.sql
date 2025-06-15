
-- 1. Add is_immutable column to grades table, defaulting to false for backward compatibility.
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS is_immutable BOOLEAN NOT NULL DEFAULT false;

-- 2. Ensure row-level security prevents editing records where is_immutable = true by teachers.
-- (You should already have RLS enabled; let's add a policy for this restriction.)
CREATE POLICY "Teachers cannot update immutable grades"
  ON public.grades
  FOR UPDATE
  USING (
    (auth.uid() = submitted_by AND is_immutable = false)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('principal', 'school_owner', 'elimisha_admin', 'edufam_admin')
    )
  );

-- Optionally, restrict DELETE as well
CREATE POLICY "Teachers cannot delete immutable grades"
  ON public.grades
  FOR DELETE
  USING (
    (auth.uid() = submitted_by AND is_immutable = false)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('principal', 'school_owner', 'elimisha_admin', 'edufam_admin')
    )
  );
