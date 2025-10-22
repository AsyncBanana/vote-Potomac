// uno.config.ts
import {
	defineConfig,
	presetIcons,
	presetWind3,
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
	extendTheme: (theme) => {
		return {
			...theme,
			breakpoints: { ...theme.breakpoints, xs: "400px" },
		};
	},
	presets: [
		presetWind3({ dark: { dark: ".nonexistent" } }),
		presetIcons(),
		presetWebFonts({
			fonts: {
				// ...s
			},
		}),
		presetTypography(),
		presetDaisy({
			themes: [
				{
					light: {
						...themes["[data-theme=light]"],
						primary: "hsl(25 100% 50%)",
						"primary-content": "white",
						secondary: "hsl(208 100% 32%)",
					},
				},
				/*{
					dark: {
						...themes["[data-theme=dark]"],
						primary: "hsl(25 100% 50%)",
						"primary-content": "white",
						secondary: "hsl(208 100% 32%)",
					},
				},*/
			],
		}),
	],
	transformers: [transformerDirectives()],
	extractors: [extractSvelte()],
	shortcuts: {
		"w-main": "w-full px-6 max-w-3xl mx-auto",
		"w-main-lg": "w-full px-6 max-w-7xl mx-auto",
	},
});
