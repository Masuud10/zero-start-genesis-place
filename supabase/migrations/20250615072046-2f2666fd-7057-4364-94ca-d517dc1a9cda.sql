
-- 1. Per-student analytics (trend, improvements, flags)
create table public.student_analytics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid references classes(id),
  reporting_period text not null, -- e.g. "2025-T2" or "2024-05"
  term text,
  year text,
  avg_grade numeric,
  prev_avg_grade numeric,
  performance_trend text, -- "up", "down", "stable"
  improvement numeric,
  attendance_rate numeric,
  absences integer,
  present integer,
  low_attendance boolean default false,
  updated_at timestamptz default now(),
  unique (student_id, reporting_period)
);

-- 2. Per-class analytics (group, trends, subject aggregations)
create table public.class_analytics (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  reporting_period text not null,
  term text,
  year text,
  avg_grade numeric,
  prev_avg_grade numeric,
  performance_trend text,
  improvement numeric,
  top_students jsonb,    -- [{ student_id, avg_grade }]
  weakest_subjects jsonb, -- [{ subject_id, avg_score }]
  best_subjects jsonb,   -- [{ subject_id, avg_score }]
  attendance_rate numeric,
  low_attendance_count integer,
  fee_collection numeric,
  outstanding_fees numeric,
  updated_at timestamptz default now(),
  unique (class_id, reporting_period)
);

-- 3. Per-school analytics (for school/principal dashboards)
create table public.school_analytics (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  reporting_period text not null,
  term text,
  year text,
  avg_grade numeric,
  best_class_id uuid,
  best_subject_id uuid,
  top_students jsonb,    -- [{ student_id, avg_grade }]
  attendance_rate numeric,
  fee_collected numeric,
  fee_pending numeric,
  collection_rate numeric,
  outstanding_fees jsonb, -- [{ class_id, amount }]
  performance_trend text,
  improvement numeric,
  updated_at timestamptz default now(),
  unique (school_id, reporting_period)
);

-- 4. System-wide analytics (for EduFam admin)
create table public.system_analytics (
  id uuid primary key default gen_random_uuid(),
  reporting_period text not null,
  year text,
  term text,
  top_schools jsonb,     -- [{ school_id, avg_grade }]
  improving_schools jsonb, -- [{ school_id, improvement }]
  low_collection_schools jsonb, -- [{ school_id, collection_rate }]
  avg_attendance numeric,
  popular_subjects jsonb, -- [{ subject_id, avg_score }]
  system_usage jsonb,     -- e.g. { active_schools, logins, data_updates }
  error_summary jsonb,    -- e.g. by school, error code, count
  updated_at timestamptz default now(),
  unique (reporting_period)
);

-- Indexes for fast filters (high cardinality access)
create index on public.student_analytics (school_id, class_id, reporting_period);
create index on public.class_analytics (school_id, reporting_period);
create index on public.school_analytics (reporting_period);

-- RLS: Only allow access to correct data
alter table public.student_analytics enable row level security;
alter table public.class_analytics enable row level security;
alter table public.school_analytics enable row level security;
alter table public.system_analytics enable row level security;

-- System-wide: Only admins may read
create policy "System admin access" on public.system_analytics
  for select
  to authenticated
  using (
    public.get_current_user_role() in ('elimisha_admin', 'edufam_admin')
  );

-- Per-school tables: School staff and admins only
create policy "School analytics access" on public.school_analytics
  for select
  to authenticated
  using (
    school_id = public.get_current_user_school_id()
    or public.get_current_user_role() in ('elimisha_admin', 'edufam_admin')
  );

create policy "Class analytics access" on public.class_analytics
  for select
  to authenticated
  using (
    school_id = public.get_current_user_school_id()
    or public.get_current_user_role() in ('elimisha_admin', 'edufam_admin')
  );

create policy "Student analytics access" on public.student_analytics
  for select
  to authenticated
  using (
    school_id = public.get_current_user_school_id()
    or public.get_current_user_role() in ('elimisha_admin', 'edufam_admin')
  );
