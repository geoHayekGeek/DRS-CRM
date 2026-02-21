# Deploying to Railway

## Prisma: "No migration found" / P3005 (database not empty)

Your production database already has tables (e.g. from an earlier `prisma db push` or manual setup), but the repo had no `prisma/migrations` folder. An initial migration has been added. You must **baseline** so Prisma treats the existing DB as already migrated.

### One-time baseline on Railway

After deploying (so the new `prisma/migrations` is in the build), open **Railway → your app → Shell** (or run a one-off job with `DATABASE_URL` set), then:

**If your DB already has all current tables** (e.g. you used `prisma db push` or created them manually), mark every migration as applied so Prisma doesn’t try to run their SQL:

```bash
# Mark each migration as already applied (use the exact folder names under prisma/migrations/)
npx prisma migrate resolve --applied 20260215100000_add_event_description_and_images
npx prisma migrate resolve --applied 20260215122904_init
npx prisma migrate resolve --applied 20260216000000_add_role_and_name

# Then run deploy (will say 0 pending)
npx prisma migrate deploy
```

**If your DB only has some tables** (e.g. only the very first schema), run `migrate resolve --applied` only for migrations that match what’s already in the DB, then run:

```bash
npx prisma migrate deploy
```

to apply the rest.

- **If you use a custom start command** that runs `prisma migrate deploy` before start, keep it. After the one-time `migrate resolve` above, future deploys will run `migrate deploy` with no issues.
- **If the DB is empty or you can wipe it**, you can skip the baseline and run only `npx prisma migrate deploy`; it will apply the init migration.

Reference: [Prisma – Baseline an existing production database](https://www.prisma.io/docs/guides/migrate/production-troubleshooting#baseline-your-production-database).

---

## Round driver refactor (20260221000000)

Driver participation is now per-round. Migration creates `round_drivers`, backfills from `group_assignments`, drops `championship_drivers`. If `migrate deploy` fails:

**Option A – Prisma (recommended)**  
In Railway’s shell (with `DATABASE_URL` set):

```bash
npx prisma db execute --file prisma/migrations/20260221000000_round_driver_refactor/migration.sql
npx prisma migrate resolve --applied 20260221000000_round_driver_refactor
```

**Option B – Run SQL in Railway’s PostgreSQL UI**  
In Railway PostgreSQL Query tab, run the migration SQL from `prisma/migrations/20260221000000_round_driver_refactor/migration.sql`.

---

## Standings override (20260225000000)

Adds `standings_overrides` table for manual tie-break ordering. If `migrate deploy` fails, run the migration SQL manually and resolve:

```bash
npx prisma db execute --file prisma/migrations/20260225000000_add_standings_override/migration.sql
npx prisma migrate resolve --applied 20260225000000_add_standings_override
```

---

## Driver point adjustments (20260224000000)

Adds `driver_point_adjustments` table for live penalty/bonus adjustments. Run normally:

```bash
npx prisma migrate deploy
```

---

## Build / start commands

- **Build:** `npm run build` (runs `prisma generate` and `next build`).
- **Start:** `npm start` (runs `next start`).

If you see `npm error npm run`, the deploy is likely invoking `npm run` with no script name. In Railway, set the build command to `npm run build` and the start command to `npm start` (or leave start empty so it uses `npm start` from `package.json`).

---

## Environment

- Set `DATABASE_URL` in Railway to your PostgreSQL connection string.
- Add any other env vars your app expects (see `.env.example`).
