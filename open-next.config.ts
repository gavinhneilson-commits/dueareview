import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config. For production-grade ISR caching, add an R2 incremental cache:
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
