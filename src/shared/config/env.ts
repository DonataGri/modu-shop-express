import "dotenv/config";

const REQUIRED_VARS = ["JWT_SECRET", "DATABASE_URL"] as const;

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}
export const env = {
  NODE_ENV: process.env.NODE_ENV || "dev",
  PORT: process.env.PORT || "3000",
  JWT_SECRET: process.env.JWT_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
};
