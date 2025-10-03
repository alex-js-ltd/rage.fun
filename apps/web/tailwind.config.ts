import { type Config } from 'tailwindcss'
/** @type {import('tailwindcss').Config} */

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			screens: {
				xs: '500px', // custom breakpoint smaller than sm
			},
			colors: {
				'background-100': 'hsl(var(--background-100))',
				'background-200': 'hsl(var(--background-200))',
				'background-300': 'hsl(var(--background-300))',
				'background-400': 'hsl(var(--background-400))',
				'background-500': 'hsl(var(--background-500))',
				'background-600': 'hsl(var(--background-600))',
				'text-100': 'hsl(var(--text-100))',
				'text-200': 'hsl(var(--text-200))',
				'text-300': 'hsl(var(--text-300))',
				'text-400': 'hsl(var(--text-400))',
				'text-500': 'hsl(var(--text-500))',

				'accent-1': '#eaeaea' /* Bright Gold */,
				'accent-2': '#999' /* Platinum */,

				'buy-100': 'hsl(var(--buy-100))',
				'buy-200': 'hsl(var(--buy-200))',

				'sell-100': 'hsl(var(--sell-100))',
				'sell-200': 'hsl(var(--sell-200))',
			},
			fontFamily: {
				sans: ['var(--font-geist-sans)'],
				mono: ['var(--font-geist-mono)'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-pink': 'linear-gradient(45deg, #06b0f9, #f906b0)',
				'conic-gradient': 'conic-gradient(from 0deg at 50% 50%, #67e8f9, #0891b2, #164e63, #0891b2, #67e8f9)',
			},

			transitionDelay: {
				'5000': '5000ms',
			},

			keyframes: {
				'slide-up-and-fade': {
					from: { opacity: '0', transform: 'translateY(4px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},

				'slide-down-and-fade': {
					from: { opacity: '1', transform: 'translateY(0px)' },
					to: { opacity: '0', transform: 'translateY(4px)' },
				},

				'scale-in-50': {
					from: { opacity: '0', transform: 'scale(0.5)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},

				'scale-out-50': {
					from: { opacity: '1', transform: 'scale(1)' },
					to: { opacity: '0', transform: 'scale(0.5)' },
				},

				'scale-in-95': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},

				'scale-out-95': {
					from: { opacity: '1', transform: 'scale(1)' },
					to: { opacity: '0', transform: 'scale(0.95)' },
				},

				loading: {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' },
				},

				slideFromBottom: {
					'0%': { transform: 'translate3d(0%, 100%, 0)' },
					'100%': { transform: 'translate3d(0%, 0, 0)' },
				},

				slideToBottom: {
					'0%': { transform: 'translate3d(0%, 0%, 0)' },
					'100%': { transform: 'translate3d(0%, 100%, 0)' },
				},

				hide: {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
				slideIn: {
					'0%': { transform: 'translate3d(0%, 100%, 0)' },
					'100%': { transform: 'translate3d(0%, 0, 0)' },
				},
				swipeOut: {
					'0%': { transform: 'translate3d(0%, 0%, 0)', opacity: '1' },
					'100%': { transform: 'translate3d(0%, 100%, 0)', opacity: '0' },
				},

				'accordion-down': {
					from: { height: '0px' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0px' },
				},

				glimmer: {
					'0%': { opacity: 'var(--glimmer-opacity-min)' },
					'100%': { opacity: 'var(--glimmer-opacity-max)' },
				},

				'animate-border': {
					'0%': {
						borderColor: '#06b0f9',
						filter: 'hue-rotate(0deg) drop-shadow(0 0 5px #06b0f9) blur(0px)',
					},
					'50%': {
						borderColor: '#f906b0',
						filter: 'hue-rotate(180deg) drop-shadow(0 0 8px #f906b0) blur(0.0125px)',
					},
					'100%': {
						borderColor: '#06b0f9',
						filter: 'hue-rotate(360deg) drop-shadow(0 0 5px #06b0f9) blur(0px)',
					},
				},

				buy: {
					'0%': { backgroundColor: 'transparent' },
					'50%': { backgroundColor: 'rgb(141 240 204 / 0.1)' }, // #8DF0CC with 10% opacity
					'100%': { backgroundColor: 'transparent' },
				},

				sell: {
					'0%': { backgroundColor: 'transparent' },
					'50%': { backgroundColor: 'rgb(229 152 155 / 0.1)' }, // #E5989B with 10% opacity
					'100%': { backgroundColor: 'transparent' },
				},
			},
			animation: {
				'slide-up-and-fade': 'slide-up-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-down-and-fade': 'slide-down-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in-50': 'scale-in-50 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-out-50': 'scale-out-50 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in-95': 'scale-in-95 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-out-95': 'scale-out-95 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				'spin-fast': 'spin 400ms linear infinite',
				'pulse-fast': 'pulse 400ms cubic-bezier(0.16, 1, 0.3, 1)',
				loading: 'loading 3s ease-in-out infinite',
				'spin-slow': 'spin 6s linear infinite',

				slideFromBottom: 'slideFromBottom 300ms cubic-bezier(0.32, 0.72, 0, 1)',
				slideToBottom: 'slideToBottom 300ms cubic-bezier(0.4, 0.0, 0.6, 1)',

				hide: 'hide 500ms ease-in',
				slideIn: 'slideIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
				swipeOut: 'swipeOut 300ms ease-out',

				'accordion-down': 'accordion-down 400ms cubic-bezier(0.4, 0, 0.2, 1)',
				'accordion-up': 'accordion-up 400ms cubic-bezier(0.4, 0, 0.2, 1)',

				glimmer:
					'glimmer var(--glimmer-animation-duration) var(--glimmer-animation-timing-function) var(--animationDelay) infinite',

				'animate-border': 'animate-border 2s linear 3',

				buy: 'buy 2000ms linear',

				sell: 'sell 2000ms linear',
			},

			backgroundSize: {
				'400%': '400% 100%',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
export default config
