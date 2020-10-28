module.exports = {
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
	purge: {
		mode: 'all',
		enable: true,
		content: ['**/*.html'],
	},
	theme: {
		extend: {
			screens: {
				dark: { raw: '(prefers-color-scheme: dark)' },
			},
		},
	},
	variants: {},
	plugins: [],
};
