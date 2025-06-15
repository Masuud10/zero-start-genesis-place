
# calc_class_analytics

This function processes all or a single school's classes and aggregates grade, attendance, and fee results per class, upserting into the `class_analytics` table.

Invoke via HTTP POST (with admin key):

```bash
curl -X POST https://lmqyizrnuahkmwauonqr.functions.supabase.co/calc_class_analytics \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"period": "2025-T2", "year": "2025", "schoolId": "<school-uuid>", "classId": "<optional-class-uuid>"}'
```

Response will include count of processed classes. Results are upserted for fast dashboard analytics.
