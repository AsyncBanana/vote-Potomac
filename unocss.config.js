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
import themes from "daisyui/src/theming/themes";
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
		presetDaisy({
			themes: [
				{
					light: {
						...themes["[data-theme=light]"],
						primary: "hsl(25 100% 50%)",
						secondary: "hsl(208 100% 32%)",
					},
				},
				{
					dark: {
						...themes["[data-theme=dark]"],
						primary: "hsl(25 100% 50%)",
						secondary: "hsl(208 100% 32%)",
					},
				},
			],
		}),
	],
	transformers: [transformerDirectives()],
	extractors: [extractSvelte()],
	shortcuts: {
		"w-main": "w-full px-6 max-w-3xl mx-auto gap-3 flex flex-col",
	},
});
