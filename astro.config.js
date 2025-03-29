import { defineConfig, passthroughImageService } from "astro/config";
import unocss from "unocss/astro";
import svelte from "@astrojs/svelte";
import extractorSvelte from "@unocss/extractor-svelte";
import cloudflare from "@astrojs/cloudflare";
import mjml from "rollup-plugin-mjml-inline";

// https://astro.build/config
export default defineConfig({
	integrations: [
		unocss({
			extractors: [extractorSvelte()],
			injectReset: "@unocss/reset/tailwind-compat.css",
		}),
		svelte(),
	],
	vite: {
		resolve: {
			alias: [
				{
					find: "@libsql/client",
					replacement: import.meta.env.PROD
						? "@libsql/client/web"
						: "@libsql/client",
				},
			],
		},
		plugins: [mjml()],
	},
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
		imageService: "passthrough",
	}),
	image: {
		service: passthroughImageService(),
	},
	site: "https://votepotomac.com",
});
