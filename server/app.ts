import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { log } from "./log";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { registerStripeWebhook } from "./stripeWebhook";

export const app = express();

export async function initializeStripeIntegration() {
  try {
    const sync = await getStripeSync();
    // PUBLIC_URL is the site's public address, e.g. https://www.example.com
    const base = process.env.PUBLIC_URL?.replace(/\/$/, "")
      ?? (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : undefined);
    if (!base) throw new Error("PUBLIC_URL is required for Stripe webhooks");
    await sync.findOrCreateManagedWebhook(`${base}/api/stripe/webhook`);
    // Full backfills are too heavy for short-lived serverless instances.
    if (!process.env.VERCEL) void sync.syncBackfill({ object: "all" }).catch(error => console.error("Stripe sync backfill failed:", error));
  } catch (error) {
    console.error("Stripe webhook setup failed; storefront is online but payment notifications may be unavailable:", error);
  }
}

registerStripeWebhook(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve attached_assets at /assets route
app.use("/assets", express.static(path.resolve(import.meta.dirname, "..", "attached_assets")));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && ![
        "/api/stripe/config", "/api/create-payment-intent",
        "/api/complete-stripe-payment",
      ].includes(reqPath)) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let ready: Promise<import("http").Server> | undefined;

/** Runs migrations and registers routes once; safe to call on every request. */
export function createApp() {
  ready ??= (async () => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
    await runMigrations({ databaseUrl: process.env.DATABASE_URL });
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ message: err.message || "Internal Server Error" });
      console.error(err);
    });
    // Serverless hosts never call listen(), so register the Stripe webhook here.
    if (process.env.VERCEL && process.env.PUBLIC_URL) await initializeStripeIntegration();
    return server;
  })();
  return ready;
}
