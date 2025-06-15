
# EduFam Universal PDF Report Generator

## What is this?

A Supabase Edge Function for generating dynamically branded, role-based PDF reports with full school and EduFam branding.

## Usage

POST to the function endpoint with:

```json
{
  "reportType": "principal-academic",   // See list of supported types
  "filters": { "schoolId": "uuid", "term": "T2", "year": "2025" },
  "userInfo": { "role": "principal", "userName": "Jane Doe", ... }
}
```

The edge function will:
- Enforce multi-tenancy (school_id, role)
- Build PDF with header, school + EduFam details, and required data table
- Include `Powered by EduFam` branding with logo and website, and a note on certificate generation (for principal)

## Supported report types (expand as needed):

- `principal-academic`
- `principal-attendance`
- ... (extend to others in next steps)

## Extending

Add more report types under the switch for `reportLabel` and `tableData` generation.

## Branding

- School logo (if available)
- EduFam logo: `/lovable-uploads/396bf63d-b84a-4ff0-9036-3d28fd1d0cb7.png`
- "Powered by EduFam" in footer

