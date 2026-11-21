# Database security tests

`rls_security_tests.sql` checks the Row Level Security rules and publishing triggers (24 checks).

Run against a **throwaway** Postgres 15+ database (never production):

```bash
createdb dar_test
psql -d dar_test -f supabase/tests/00_supabase_stubs.sql      # minimal stand-ins for Supabase's auth/storage schemas
for f in supabase/migrations/*.sql; do psql -d dar_test -f "$f"; done
psql -d dar_test -f supabase/tests/rls_security_tests.sql
```
Every line should read `PASS` or end in `| t`.
