import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'

const config: UserConfig = {
	plugins: [
		sveltekit(),
		{
			...inject({
				global: ['node-stdlib-browser/helpers/esbuild/shim', 'global'],
				process: ['node-stdlib-browser/helpers/esbuild/shim', 'process'],
				Buffer: ['node-stdlib-browser/helpers/esbuild/shim', 'Buffer'],
			}),
			enforce: 'post',
		},
	],
	resolve: {
		alias: stdLibBrowser,
	},
	optimizeDeps: {
		include: ['buffer', 'process'],
	},
}

export default config
