
# calc_student_analytics

This function processes all (or a single) school and aggregates recent grade/attendance results per student, upserting into the `student_analytics` table. 
- Uses Service Role key for safe aggregation.
- Future enhancements: Accept date/term/period filters, parallelize for many students, etc.

Invoke via HTTP POST (with admin key):

```bash
curl -X POST https://lmqyizrnuahkmwauonqr.functions.supabase.co/calc_student_analytics \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"period": "2025-T2", "year": "2025"}'
```

Response will include count of processed students.
