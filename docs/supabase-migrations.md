# Running Supabase migrations (hosted project)

To apply your local migrations directly to your **hosted Supabase** project:

## 1. Install the Supabase CLI

```bash
npm install -g supabase
```

Or use it without installing (via npx):

```bash
npx supabase --version
```

## 2. Log in to Supabase

```bash
npx supabase login
```

This opens a browser to authenticate and stores your access token locally.

## 3. Link this project to your hosted project

You need your **Project ref** from the Supabase dashboard:

- Open [Supabase Dashboard](https://app.supabase.com) → your project
- **Settings** → **General** → copy **Reference ID**  
  (or use the ID from the URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`)

Then run:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

When prompted, enter your **database password** (the one you set when creating the project; you can reset it under **Settings** → **Database** if needed).

Linking creates/updates `.supabase` in the project root (gitignored) so the CLI knows which remote project to use.

## 4. Push migrations to the remote database

From the project root:

```bash
npx supabase db push
```

Or use the npm script:

```bash
npm run db:push
```

This runs all migration files in `supabase/migrations/` that haven’t been applied yet on the remote database.

---

## Optional: use a database password in env

To avoid being prompted for the database password each time, set:

```bash
# In .env.local (do not commit)
SUPABASE_DB_PASSWORD=your_database_password
```

The CLI reads `SUPABASE_DB_PASSWORD` when set. Add it to `.env.local` and re-run `npm run db:push`.

---

## Summary

| Step              | Command |
|-------------------|--------|
| Login (one-time)  | `npx supabase login` |
| Link (one-time)   | `npx supabase link --project-ref YOUR_PROJECT_REF` |
| Apply migrations  | `npx supabase db push` or `npm run db:push` |

After linking, any new migration you add under `supabase/migrations/` can be applied with `npm run db:push` (or `npx supabase db push`).
