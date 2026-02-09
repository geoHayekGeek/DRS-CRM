const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

export function validateEnv() {
  // Skip during Next.js build - env vars may not be available when collecting page data
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
