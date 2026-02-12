/**
 * One-time script: mark all migrations as applied.
 * Use when the DB already has all tables but _prisma_migrations is out of sync.
 * Run: node scripts/resolve-all-migrations.js
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");
const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
const migrationNames = entries
  .filter((e) => e.isDirectory() && /^\d+_.+$/.test(e.name))
  .map((e) => e.name)
  .sort();

console.log("Marking", migrationNames.length, "migrations as applied...\n");
for (const name of migrationNames) {
  try {
    execSync(`npx prisma migrate resolve --applied "${name}"`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("  OK:", name);
  } catch (err) {
    console.log("  (skip or already applied):", name);
  }
}
console.log("\nDone. Run: npm run migrate:deploy");
