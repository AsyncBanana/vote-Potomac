/** @type {import("prettier").Config} */
module.exports = {
	useTabs: true,
	overrides: [
		{
			files: ["**/*.astro"],
			options: {
				parser: "astro",
			},
		},
	],
};
