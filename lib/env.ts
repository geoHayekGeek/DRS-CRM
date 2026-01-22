const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

export function validateEnv() {
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
