import type { IncomingMessage, ServerResponse } from "http";
import { getStripeClient } from "../server/stripeClient";
import { reconcileExpiredReservations } from "../server/payments";

// Backstop for the in-process timer used elsewhere: release expired checkout holds.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.statusCode = 401;
    return res.end("Unauthorized");
  }
  await reconcileExpiredReservations(await getStripeClient());
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ ok: true }));
}
