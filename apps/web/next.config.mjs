/** @type {import('next').NextConfig} */

import createMDX from '@next/mdx'

const nextConfig = {
	// Configure `pageExtensions` to include markdown and MDX files
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
	experimental: {
		instrumentationHook: true,
		mdxRs: true,
		serverComponentsExternalPackages: ['ably', 'twitter-api-v2'],
		bodySizeLimit: '1mb',
	},

	images: {
		formats: ['image/webp'],

		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img-v1.raydium.io',
				port: '',
				pathname: '/icon/**',
			},

			{
				protocol: 'https',
				hostname: 'vn5d3lsmmr2noe9p.public.blob.vercel-storage.com',
				port: '',
				pathname: '/**',
			},

			{
				protocol: 'https',
				hostname: 'vqcczuygjg63d4lo.public.blob.vercel-storage.com',
				port: '',
				pathname: '/**',
			},

			{
				protocol: 'https', // Add the protocol for loremflickr
				hostname: 'loremflickr.com', // Add the hostname for loremflickr
				port: '',
				pathname: '/**', // Allow all paths under this hostname
			},

			{
				protocol: 'https',
				hostname: 'picsum.photos', // Add picsum.photos
				port: '',
				pathname: '/**', // Allow all paths under this domain
			},

			{
				protocol: 'https',
				hostname: 'indigo-adverse-vicuna-777.mypinata.cloud', // Add picsum.photos
				port: '',
				pathname: '/**', // Allow all paths under this domain
			},

			{
				protocol: 'https',
				hostname: 'violet-giant-deer-1.mypinata.cloud', // Add picsum.photos
				port: '',
				pathname: '/**', // Allow all paths under this domain
			},

			{
				protocol: 'https',
				hostname: 'cdn.discordapp.com', // Add picsum.photos
				port: '',
				pathname: '/**', // Allow all paths under this domain
			},
		],
	},
	transpilePackages: ['geist'],

	webpack(config, { isServer, dev }) {
		// Use the client static directory in the server bundle and prod mode
		// Fixes `Error occurred prerendering page "/"`
		config.output.webassemblyModuleFilename =
			isServer && !dev ? '../static/wasm/[modulehash].wasm' : 'static/wasm/[modulehash].wasm'

		// Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
		config.experiments = { ...config.experiments, asyncWebAssembly: true }

		return config
	},
}

const withMDX = createMDX({
	// Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
