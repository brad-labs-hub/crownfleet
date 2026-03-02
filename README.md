# Fleet Manager

A full-stack fleet management application for high net worth families. Manage vehicles, maintenance records, receipts, insurance, registrations, key inventory, tire pressure, and more.

## Features

- **Driver Interface** (mobile-first): Add receipts, log maintenance, request cars, view vehicles
- **Admin Dashboard**: Full CRUD for vehicles, receipts, car request approval, exports
- **Exports**: Excel and QuickBooks CSV
- **Cloud Import**: OneDrive and Google Drive (OAuth)
- **Document Vault**: Upload insurance and registration documents
- **Key Inventory**: Track keys per vehicle
- **Tire/Fluid Tracking**: Seasonal swaps, pressure, fluid levels
- **Maintenance Alerts**: Create and dismiss alerts

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL, Auth, Storage)
- Tailwind CSS, shadcn/ui

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run migrations**:
   ```bash
   npx supabase link  # Link to your project
   npx supabase db push  # Apply migrations
   npx supabase db seed  # Seed locations
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase URL and anon key.

4. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```

5. **Create an account** at `/signup`. New users get the `driver` role by default.

6. **Promote a user to controller** (run in Supabase SQL editor):
   ```sql
   UPDATE user_profiles SET role = 'controller' WHERE email = 'your@email.com';
   ```

7. **Assign driver to locations** (for RLS):
   ```sql
   INSERT INTO driver_locations (user_id, location_id)
   SELECT 'user-uuid', id FROM locations WHERE code = '858';
   ```

## Locations (Seed Data)

| Code | Name | Address |
|------|------|---------|
| 858 | New Canaan, CT | New Canaan, CT |
| 432 | 432 Park Avenue | 432 Park Ave, NYC |
| Four Chaise | Four Chaise | 163 S Main St, Southampton, NY |
| Pink Chimneys | Pink Chimneys | Bermuda |
| Chipper | Chipper | New Canaan, CT |

## Cloud Import (Optional)

Set these in `.env.local` to enable OneDrive/Google Drive import:

- `NEXT_PUBLIC_ONEDRIVE_CLIENT_ID` / `ONEDRIVE_CLIENT_SECRET`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

## Password Reset

For "Forgot password?" to work, add your app URL to Supabase redirect URLs:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**: `http://localhost:3000/reset-password` (and your production URL when deployed)

## Roles

- **driver**: Add receipts, log maintenance, request cars. Sees vehicles at assigned locations.
- **employee**: Same as driver + approve car requests, full read access.
- **controller**: Full access, exports, imports, user management.
