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
	},
	darkMode: 'media',
	theme: { colors: { ...colors } },
	variants: {},
	plugins: [],
};
