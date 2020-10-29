module.exports = {
	plugins: [
		require('postcss-import'),
		require('postcss-nesting'),
		require('tailwindcss'),
		require('autoprefixer'),
		require('cssnano'),
		require('postcss-hash'),
	],
};
