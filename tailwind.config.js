const colors = require('tailwindcss/colors')

module.exports = {
	mode: 'jit',
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
	purge: {
		mode: 'all',
		enable: true,
		content: ['**/*.html'],
		safelist: [
			"dark:bg-rose-800",
			"bg-rose-500",
			"text-rose-700",
			"dark:text-rose-600"
		]
	},
	darkMode: 'media',
	theme: { colors: { ...colors } },
	variants: {},
	plugins: [],
};
