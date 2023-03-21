import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const config: UserConfig = {
	plugins: [
		sveltekit(),
		nodePolyfills({
			// Whether to polyfill `node:` protocol imports.
			protocolImports: true,
		}),
	],
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
	},
	optimizeDeps: {
		include: ['buffer', 'process'],
	},
}

export default config
