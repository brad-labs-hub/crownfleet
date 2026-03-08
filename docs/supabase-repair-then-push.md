# Repair migration history then push Fleetio-only migrations

Your remote database already has the schema from the first 7 migrations, but Supabase doesn't have them recorded. Run the commands below **from the project root** so the CLI only applies the 4 Fleetio migrations.

## 1. Mark already-applied migrations as applied

Run each of these (one line per migration that's already on your DB):

```bash
npx supabase migration repair 20240302000001 --status applied
npx supabase migration repair 20240302000002 --status applied
npx supabase migration repair 20240302000003 --status applied
npx supabase migration repair 20240302000004 --status applied
npx supabase migration repair 20260302000005 --status applied
npx supabase migration repair 20260302100000 --status applied
npx supabase migration repair 20260303000001 --status applied
```

Or as a single copy-paste:

```bash
npx supabase migration repair 20240302000001 --status applied && \
npx supabase migration repair 20240302000002 --status applied && \
npx supabase migration repair 20240302000003 --status applied && \
npx supabase migration repair 20240302000004 --status applied && \
npx supabase migration repair 20260302000005 --status applied && \
npx supabase migration repair 20260302100000 --status applied && \
npx supabase migration repair 20260303000001 --status applied
```

## 2. Push (only the 4 Fleetio migrations will run)

```bash
npm run db:push
```

That will apply only:

- `20260303100000_vehicle_odometer.sql`
- `20260303100001_driver_assignments.sql`
- `20260303100002_vehicle_inspections.sql`
- `20260303100003_maintenance_status.sql`
