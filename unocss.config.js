// uno.config.ts
import {
	defineConfig,
	presetIcons,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	presetTypography,
} from "unocss";
import extractSvelte from "@unocss/extractor-svelte";
import { presetDaisy } from "unocss-preset-daisy";
export default defineConfig({
	shortcuts: [
		// ...
	],
	theme: {
		colors: {
			// ...
		},
	},
	presets: [
		presetUno({
			dark: "media",
		}),
		presetIcons(),
		presetWebFonts({
			fonts: {
				// ...
			},
		}),
		presetTypography(),
		presetDaisy(),
	],
	transformers: [transformerDirectives()],
	extractors: [extractSvelte()],
	shortcuts: {
		"w-main": "w-full p-6 max-w-3xl m-auto gap-3 flex flex-col",
	},
});
