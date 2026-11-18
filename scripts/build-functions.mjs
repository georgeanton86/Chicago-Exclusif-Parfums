// Bundles the Vercel functions into single self-contained files (api/*.js).
// Run `npm run build:api` after changing server code, and commit the result.
import { build } from "esbuild";

const common = { bundle: true, platform: "node", format: "esm", packages: "external", target: "node20", tsconfig: "tsconfig.json",
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" } };
await build({ ...common, entryPoints: ["serverless/index.ts"], outfile: "api/index.js" });
await build({ ...common, entryPoints: ["serverless/reconcile.ts"], outfile: "api/cron/reconcile.js" });
console.log("built api/index.js and api/cron/reconcile.js");
