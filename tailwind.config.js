/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		'./index.html',
		'./src/**/*.{html,js,ts,vue}'
	],
	theme: {
		extend: {
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'fadetransform': 'opacity, transform',
			},
			maxWidth: {
				'1/2': '50%',
			},
			minWidth: {
				'1/2': '50%',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('daisyui'),
	],
	darkMode: ['class', '[data-theme="dark"]'],
	daisyui: {
		logs: false,
		themes: [
			{
				light: {
					"primary": "#4169E1",
					"secondary": "#3454B4",
					"accent": "#7C4DFF",
					"neutral": "#383938",
					"base-100": "#F4F4F5",
					"info": "#38BDF8",
					"success": "#2DC659",
					"warning": "#EAB308",
					"error": "#EF4444",
				},
			},
			{
				dark: {
					"primary": "#E39476",
					"secondary": "#B5765E",
					"accent": "#7C4DFF",
					"neutral": "#F4F4F5",
					"base-100": "#383938",
					"info": "#38BDF8",
					"success": "#2DC659",
					"warning": "#EAB308",
					"error": "#EF4444",
				},
			},
		],
	},
}
