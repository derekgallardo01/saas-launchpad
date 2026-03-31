import { db } from "@/lib/db";
import { log } from "@/lib/logger";

const startTime = Date.now();

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

interface HealthResponse {
  status: "healthy" | "degraded";
  version: string;
  uptime: string;
  database: "connected" | "disconnected";
  timestamp: string;
  checks: {
    database: { status: "pass" | "fail"; latencyMs: number | null };
  };
}

export async function GET(): Promise<Response> {
  const uptimeMs = Date.now() - startTime;
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let dbLatency: number | null = null;

  try {
    const dbStart = Date.now();
    // Simple connectivity check — execute a lightweight query.
    await db.$queryRawUnsafe("SELECT 1");
    dbLatency = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (err) {
    log.warn("Health check: database unreachable", { error: String(err) });
  }

  const isHealthy = dbStatus === "connected";

  const body: HealthResponse = {
    status: isHealthy ? "healthy" : "degraded",
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: formatUptime(uptimeMs),
    database: dbStatus,
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbStatus === "connected" ? "pass" : "fail",
        latencyMs: dbLatency,
      },
    },
  };

  return Response.json(body, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
