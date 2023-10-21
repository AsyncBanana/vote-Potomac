import { defineConfig } from "astro/config";
import unocss from "unocss/astro";
import svelte from "@astrojs/svelte";
import extractorSvelte from "@unocss/extractor-svelte";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [unocss({
    extractors: [extractorSvelte()],
    injectReset: true
  }), svelte()],
  vite: {
    resolve: {
      alias: [{
        find: "@libsql/client",
        replacement: import.meta.env.PROD ? "@libsql/client/web" : "@libsql/client"
      }]
    }
  },
  output: "hybrid",
  adapter: cloudflare()
});
