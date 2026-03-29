# Crownfleet — Demo Data Setup

> **Demo only.** This seed is for a demo/staging Supabase project. Never run it against a production database containing real client data.

## What the demo contains

| Entity | Count | Notes |
|--------|-------|-------|
| Locations | 5 | `CROWN-CT`, `CROWN-NYC`, `CROWN-FL`, `CROWN-CA`, `CROWN-SC` |
| Vehicles | 10 | G 63 AMG, Cayenne Turbo GT, S 580, X7, M5 Comp, Range Rover Autobiography, Bentayga EWB, Ghost Black Badge, Urus Performante, Purosangue |
| Registrations | 10 | States: CT × 2, NY × 2, FL × 2, CA × 2, SC × 2 — 4 expiring within 90 days |
| Insurance | 10 | Chubb, Pure Insurance, AIG, Berkley One — 3 expiring within 60 days |
| Warranties | 20 | 2 per vehicle — `bumper_to_bumper` (mixed near/long) + `powertrain_warranty` (3–5 yr) |
| Receipts | 32 | All 8 categories: gas, detailing, parking, food, miscellaneous, ez_pass, auto_supplies, maintenance |
| Maintenance records | 15 | Types: oil, tire_rotation, brakes, battery, inspection, general |
| Maintenance alerts | 10 | Mixed severity — 3 due within 30 days |
| Vehicle documents | 4 | Title + insurance dec pages (placeholder PDF URLs) |

All demo rows are tagged (`notes LIKE '[DEMO]%'` or `vin LIKE '1DEMFLEET%'`) for clean removal.

---

## Prerequisites

1. A **fresh Supabase project** created at [supabase.com](https://supabase.com) — separate from any production project.
2. All migrations applied (see [supabase-migrations.md](supabase-migrations.md)):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npm run db:push
   ```

---

## Run order

### Step 1 — Apply migrations
```bash
cd /path/to/crownfleet
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

### Step 2 — Run the demo seed
Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard) for your demo project, paste the full contents of [`supabase/seed-demo-crownfleet.sql`](../supabase/seed-demo-crownfleet.sql), and click **Run**.

Verify with these counts (also in the file footer):
```sql
SELECT count(*) FROM vehicles  WHERE vin LIKE '1DEMFLEET%';         -- expect 10
SELECT count(*) FROM locations WHERE code LIKE 'CROWN-%';           -- expect 5
SELECT count(*) FROM receipts  WHERE notes LIKE '[DEMO]%';          -- expect 32
SELECT count(*) FROM maintenance_alerts WHERE notes LIKE '[DEMO]%'; -- expect 10
```

### Step 3 — Set Supabase Auth redirect URLs
In [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration):

- **Site URL:** `https://crownfleet.vercel.app`
- **Redirect URLs** — add all of the following:
  - `https://crownfleet.vercel.app/auth/callback`
  - `https://crownfleet.vercel.app/reset-password`
  - `https://crownfleet.vercel.app/api/auth/google/callback` *(if using Google Drive import)*
  - `https://crownfleet.vercel.app/api/auth/onedrive/callback` *(if using OneDrive import)*
  - `http://localhost:3000/auth/callback` *(for local dev)*
  - `http://localhost:3000/reset-password` *(for local dev)*

### Step 4 — Set Vercel environment variables
In [Vercel → crownfleet → Settings → Environment Variables](https://vercel.com/brad-lawsons-projects/crownfleet/settings/environment-variables) (Production):

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` secret |
| `NEXT_PUBLIC_APP_URL` | `https://crownfleet.vercel.app` |

Redeploy after saving env vars.

### Step 5 — Create and promote your first user

1. Open `https://crownfleet.vercel.app/login` and sign up with your email.
2. In [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql), run:
   ```sql
   UPDATE user_profiles
   SET role = 'controller'
   WHERE email = 'your@email.com';
   ```

3. *(Optional)* Assign the controller to all Crown Fleet locations so they can see all vehicles:
   ```sql
   INSERT INTO driver_locations (user_id, location_id)
   SELECT
     (SELECT id FROM auth.users WHERE email = 'your@email.com'),
     id
   FROM locations
   WHERE code LIKE 'CROWN-%'
   ON CONFLICT DO NOTHING;
   ```

---

## Demo login (pre-created)

If you ran the app setup steps earlier, a demo user was created:

| Field | Value |
|-------|-------|
| Email | `demo@crownfleet.app` |
| Password | `CrownDemo2026!` |
| Role | `controller` |

---

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with your demo Supabase credentials
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Reset demo data

To wipe only demo rows and re-run the seed fresh:

```sql
-- Run in Supabase SQL Editor — clears demo data in safe dependency order
DELETE FROM receipts            WHERE notes LIKE '[DEMO]%';
DELETE FROM maintenance_alerts  WHERE notes LIKE '[DEMO]%';
DELETE FROM maintenance_records WHERE notes LIKE '[DEMO]%';
DELETE FROM vehicle_warranties  WHERE notes LIKE '[DEMO]%';
DELETE FROM vehicle_documents   WHERE notes LIKE '[DEMO]%';
DELETE FROM insurance           WHERE notes LIKE '[DEMO]%';
DELETE FROM registrations       WHERE notes LIKE '[DEMO]%';
DELETE FROM vehicles            WHERE vin  LIKE '1DEMFLEET%';
DELETE FROM locations           WHERE code LIKE 'CROWN-%';
```

Then paste and re-run `supabase/seed-demo-crownfleet.sql`.

---

## Production safety

- All demo vehicles use synthetic VINs prefixed `1DEMFLEET` — never collide with real VINs.
- All demo locations use codes prefixed `CROWN-` — distinct from real location codes (`858`, `432`, etc.).
- All supporting rows (`receipts`, `alerts`, etc.) carry `notes` starting with `[DEMO]`.
- The seed file uses `WHERE NOT EXISTS` / `ON CONFLICT DO NOTHING` — safe to run twice without duplicates.
