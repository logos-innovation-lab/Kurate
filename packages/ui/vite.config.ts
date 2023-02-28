import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'

export default defineConfig({
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
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
	},
	resolve: {
		alias: stdLibBrowser,
	},
	optimizeDeps: {
		include: ['buffer', 'process'],
	},
})
