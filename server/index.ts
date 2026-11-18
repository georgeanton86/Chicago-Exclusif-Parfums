import { app, createApp, initializeStripeIntegration } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import { getStripeClient } from "./stripeClient";
import { reconcileExpiredReservations } from "./payments";

(async () => {
  const server = await createApp();

  // The catch-all must come after every API route.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
    void initializeStripeIntegration();
    const cleanup = async () => {
      try {
        await reconcileExpiredReservations(await getStripeClient());
      } catch (error) {
        console.error("Chicago reservation reconciliation failed:", error);
      }
    };
    void cleanup();
    setInterval(() => void cleanup(), 60_000).unref();
  });
})();
