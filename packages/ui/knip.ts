import sveltePreprocess from 'svelte-preprocess'
import { preprocess, compile } from 'svelte/compiler'

const sveltePreprocessor = sveltePreprocess()

export default {
	ignore: ['**/*.d.ts'],
	paths: {
		// This ain't pretty, but Svelte basically does the same
		'$app/*': ['node_modules/@sveltejs/kit/src/runtime/app/*'],
		'$lib/*': ['src/lib/*'],
	},
	compilers: {
		svelte: async (text: string) => {
			const processed = await preprocess(text, sveltePreprocessor, { filename: 'dummy.ts' })
			const compiled = compile(processed.code)
			return compiled.js.code
		},
		css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
	},
	svelte: {
		entry: [
			'svelte.config.js',
			'vite.config.ts',
			// FIXME: This incorrectly reports `src/routes/(home)/chat/(chats)/+layout@.svelte` as unused
			'src/routes/**/+{page,page.server,error,layout,layout.server}.{js,ts,svelte}',
		],
		project: ['src/**/*.{js,ts,svelte}'],
	},
}
