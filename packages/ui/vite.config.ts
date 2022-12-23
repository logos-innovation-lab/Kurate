import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import type { InputPluginOption } from 'rollup'

const config: UserConfig = {
	plugins: [sveltekit()],

	// For more info see https://medium.com/@ftaioli/using-node-js-builtin-modules-with-vite-6194737c2cd2
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis',
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true,
				}),
				NodeModulesPolyfillPlugin(),
			],
		},
	},
	build: {
		rollupOptions: {
			plugins: [
				// Enable rollup polyfills plugin
				// used during production bundling
				rollupNodePolyFill() as InputPluginOption,
			],
		},
	},
}

export default config
