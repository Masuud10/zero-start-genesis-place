
# EduFam Universal PDF Report Generator

## What is this?
A Supabase Edge Function for generating dynamically branded, role-based PDF reports with full school and EduFam branding.

## Usage

POST to the function endpoint with:
```json
{
  "reportType": "principal-academic",   // See list of supported types below
  "filters": { "schoolId": "uuid", "term": "T2", "year": "2025" },
  "userInfo": { "role": "principal", "userName": "Jane Doe", ... }
}
```

## Supported report types (expand as needed):

- `principal-academic` (grades: principal/school owner)
- `principal-attendance` (attendance: principal/school owner)
- `principal-finance` (finance: principal/school owner, finance_officer)
- `school-summary` (school summary: principal/school owner)
- `teacher-parent-grades` (grades: teacher/parent)
- `teacher-parent-attendance` (attendance: teacher/parent)
- *(extend more if needed)*

The edge function will:
- Enforce multi-tenancy (school_id, role)
- Build PDF with header, school + EduFam details, and required data table
- Include `Powered by EduFam` branding with logo and website, and a note on certificate generation (for principal)

## Extending

Add more report types under the switch for `reportLabel` and `tableData` generation inside the Edge Function.

## Branding

- School logo (if available)
- EduFam logo: `/lovable-uploads/396bf63d-b84a-4ff0-9036-3d28fd1d0cb7.png`
- "Powered by EduFam" in footer
