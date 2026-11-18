import type { IncomingMessage, ServerResponse } from "http";
import { app, createApp } from "../server/app";

// Vercel entry point: every /api/* request is handled by the Express app.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await createApp();
  app(req as any, res as any);
}
