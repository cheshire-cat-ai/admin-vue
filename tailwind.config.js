/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./index.html', './src/**/*.{html,js,ts,vue}'],
	theme: {
		extend: {
			transitionProperty: {
				height: 'height',
				spacing: 'margin, padding',
				width: 'width',
				fadetransform: 'opacity, transform',
			},
			maxWidth: {
				'1/2': '50%',
			},
			minWidth: {
				'1/2': '50%',
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('daisyui')],
	darkMode: ['class', '[data-theme="dark"]'],
	daisyui: {
		logs: false,
		themes: [
			{
				light: {
					primary: '#0E8f7E',
					secondary: '#C6FFF7',
					accent: '#14CC9E',
					neutral: '#383938',
					'base-100': '#F4F4F5',
					info: '#38BDF8',
					'info-content': '#F4F4F5',
					success: '#2DC659',
					'success-content': '#F4F4F5',
					warning: '#EAB308',
					'warning-content': '#F4F4F5',
					error: '#EF4444',
					'error-content': '#F4F4F5',
				},
			},
			{
				dark: {
					primary: '#14CC9E',
					secondary: '#C6FFF7',
					accent: '#0E8f7E',
					neutral: '#F4F4F5',
					'base-100': '#383938',
					info: '#38BDF8',
					'info-content': '#383938',
					success: '#2DC659',
					'success-content': '#383938',
					warning: '#EAB308',
					'warning-content': '#383938',
					error: '#EF4444',
					'error-content': '#383938',
				},
			},
		],
	},
}
