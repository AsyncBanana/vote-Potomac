// uno.config.ts
import {
	defineConfig,
	presetIcons,
	presetUno,
	presetWebFonts,
	transformerDirectives,
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
		presetUno(),
		presetIcons(),
		presetWebFonts({
			fonts: {
				// ...
			},
		}),
		presetDaisy(),
	],
	transformers: [transformerDirectives()],
	extractors: [extractSvelte()],
	shortcuts: {
		"w-main":
			"w-full p-6 md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5 m-auto gap-3 flex flex-col",
	},
});
