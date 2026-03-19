import { readFileSync } from "node:fs";
import { z } from "zod";

const EnvSchema = z.object({
  REDTRACK_API_KEY: z.string().min(1, "REDTRACK_API_KEY is required"),
  REDTRACK_ENV_FILE: z.string().default(".env"),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

function parseDotenv(path: string): Record<string, string> {
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return {};
  }
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const cleaned = trimmed.replace(/^export\s+/, "");
    const eq = cleaned.indexOf("=");
    if (eq === -1) continue;
    const key = cleaned.slice(0, eq).trim();
    let val = cleaned.slice(eq + 1).trim();
    // Strip quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    // Strip inline comments (only outside quotes)
    const commentIdx = val.indexOf(" #");
    if (commentIdx !== -1) {
      val = val.slice(0, commentIdx).trim();
    }
    vars[key] = val;
  }
  return vars;
}

export function loadEnv(): Env {
  const envFile = process.env.REDTRACK_ENV_FILE ?? ".env";
  const dotenvVars = parseDotenv(envFile);

  // dotenv vars fill in missing process.env values
  for (const [key, val] of Object.entries(dotenvVars)) {
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }
  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (_env) return _env;
  return loadEnv();
}
