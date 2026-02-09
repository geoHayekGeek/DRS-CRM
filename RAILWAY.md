# Deploying to Railway

## Prisma: "No migration found" / P3005 (database not empty)

Your production database already has tables (e.g. from an earlier `prisma db push` or manual setup), but the repo had no `prisma/migrations` folder. An initial migration has been added. You must **baseline** so Prisma treats the existing DB as already migrated.

### One-time baseline on Railway

After deploying (so the new `prisma/migrations` is in the build), run these in Railway’s shell (or in a one-off job with `DATABASE_URL` set):

```bash
# 1. Mark the initial migration as already applied (do not run its SQL)
npx prisma migrate resolve --applied 20250209140000_init

# 2. Apply any future migrations (will report 0 pending after baseline)
npx prisma migrate deploy
```

- **If you use a custom start command** that runs `prisma migrate deploy` before start, keep it. After the one-time `migrate resolve` above, future deploys will run `migrate deploy` with no issues.
- **If the DB is empty or you can wipe it**, you can skip the baseline and run only `npx prisma migrate deploy`; it will apply the init migration.

Reference: [Prisma – Baseline an existing production database](https://www.prisma.io/docs/guides/migrate/production-troubleshooting#baseline-your-production-database).

---

## "The table championship_drivers does not exist" (P2021)

This happens when a migration was **marked as applied** during baseline (`prisma migrate resolve --applied ...`) but its SQL was never run, so the table was never created.

**Fix:** Create the missing table on the production database.

**Option A – Prisma (recommended)**  
In Railway’s shell (with `DATABASE_URL` set):

```bash
npx prisma db execute --file prisma/fix-championship-drivers.sql
```

**Option B – Run SQL in Railway’s PostgreSQL UI**  
In Railway → your PostgreSQL service → Data or Query tab, run the contents of `prisma/fix-championship-drivers.sql`.

After the table exists, restart the app; the error should go away.

---

## Build / start commands

- **Build:** `npm run build` (runs `prisma generate` and `next build`).
- **Start:** `npm start` (runs `next start`).

If you see `npm error npm run`, the deploy is likely invoking `npm run` with no script name. In Railway, set the build command to `npm run build` and the start command to `npm start` (or leave start empty so it uses `npm start` from `package.json`).

---

## Environment

- Set `DATABASE_URL` in Railway to your PostgreSQL connection string.
- Add any other env vars your app expects (see `.env.example`).
